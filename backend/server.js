const http = require('http');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const { sequelize, User, Role, UserRole } = require('./models');
const initializeSockets = require('./sockets');

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Socket.IO with authentication and handlers
initializeSockets(io);

// Make io accessible to routes
app.set('io', io);

// Run the SQL schema once if the database has no tables yet.
const bootstrapDatabase = async () => {
  try {
    const [rows] = await sequelize.query(
      "SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = :db AND table_name = 'users'",
      { replacements: { db: process.env.DB_NAME } }
    );
    const usersTableExists = Number(rows[0].cnt) > 0;
    if (usersTableExists) {
      console.log('Database schema already present. Skipping bootstrap.');
      return;
    }

    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.warn('schema.sql not found at', schemaPath, '- skipping bootstrap.');
      return;
    }

    console.log('No tables found. Bootstrapping database from schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await sequelize.query(schemaSql);
    console.log('Database schema created successfully.');
  } catch (error) {
    console.error('Database bootstrap failed:', error.message);
  }
};

// Reconcile any column drift between the Sequelize models and the live DB
// (e.g. adds columns that exist in models but are missing in schema.sql).
const reconcileSchema = async () => {
  try {
    console.log('Reconciling database schema with models...');
    await sequelize.sync({ alter: true });
    console.log('Schema reconciliation complete.');
  } catch (error) {
    console.error('Schema reconciliation failed:', error.message);
  }
};

// Create a super_admin account from env vars on first run (secure: no hardcoded password).
const seedAdminUser = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('ADMIN_EMAIL/ADMIN_PASSWORD not set. Skipping admin seed.');
    return;
  }
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('Admin user already exists. Skipping admin seed.');
      return;
    }
    const role = await Role.findOne({ where: { name: 'super_admin' } });
    if (!role) {
      console.warn('super_admin role not found. Skipping admin seed.');
      return;
    }
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    const user = await User.create({
      id: uuidv4(),
      email,
      password_hash,
      first_name: 'Super',
      last_name: 'Admin',
      is_active: true,
      is_verified: true,
    });
    await UserRole.create({ user_id: user.id, role_id: role.id });
    console.log(`Admin user created: ${email}`);
  } catch (error) {
    console.error('Admin seed failed:', error.message);
  }
};

// Seed demo data (shops, customers, requests, etc.) when SEED_DEMO_DATA=true and DB has no shops.
const seedDemoData = async () => {
  if (process.env.SEED_DEMO_DATA !== 'true') {
    app.set('demoSeedStatus', { skipped: 'SEED_DEMO_DATA not true' });
    return;
  }
  try {
    const [rows] = await sequelize.query('SELECT COUNT(*) AS cnt FROM shops');
    if (Number(rows[0].cnt) > 0) {
      console.log('Demo data already present (shops exist). Skipping demo seed.');
      app.set('demoSeedStatus', { skipped: 'shops already exist' });
      return;
    }
    const seedPath = path.join(__dirname, 'database', 'seed.sql');
    if (!fs.existsSync(seedPath)) {
      console.warn('seed.sql not found. Skipping demo seed.');
      app.set('demoSeedStatus', { error: 'seed.sql not found' });
      return;
    }
    console.log('Seeding demo data...');
    let seedSql = fs.readFileSync(seedPath, 'utf8');
    // The seed file ships with a placeholder hash; swap in a valid bcrypt hash for "password123".
    const validHash = bcrypt.hashSync('password123', 10);
    seedSql = seedSql.split('$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe').join(validHash);
    // sequelize.sync({alter}) strips DEFAULT CURRENT_TIMESTAMP from timestamp columns, so raw
    // INSERTs that omit created_at would fail under strict mode. Relax mode + backfill timestamps.
    seedSql = "SET SESSION sql_mode = '';\n" + seedSql;
    await sequelize.query(seedSql);
    // Backfill any zero/empty timestamps produced while strict mode was off.
    for (const t of ['users', 'shops', 'customers', 'delivery_agents', 'delivery_boys']) {
      try {
        await sequelize.query(
          `UPDATE ${t} SET created_at = NOW() WHERE created_at IS NULL OR created_at < '1971-01-01 00:00:00'`
        );
        await sequelize.query(
          `UPDATE ${t} SET updated_at = NOW() WHERE updated_at IS NULL OR updated_at < '1971-01-01 00:00:00'`
        );
      } catch (e) { /* ignore per-table backfill issues */ }
    }
    console.log('Demo data seeded successfully. Demo accounts use password: password123');
    app.set('demoSeedStatus', { success: true });
  } catch (error) {
    console.error('Demo data seed failed:', error.message);
    app.set('demoSeedStatus', {
      error: error.message,
      code: error.original ? error.original.code : (error.parent ? error.parent.code : undefined),
      sql: error.original ? error.original.sqlMessage : undefined,
    });
  }
};

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    // Create tables on first run if they do not exist yet.
    await bootstrapDatabase();
    // Align existing tables with current models (adds any missing columns).
    await reconcileSchema();
    // Create the super_admin account if ADMIN_EMAIL/ADMIN_PASSWORD are configured.
    await seedAdminUser();
    // Seed demo data if SEED_DEMO_DATA=true.
    await seedDemoData();
  } catch (error) {
    console.warn('Database connection failed:', error.message);
    console.warn('Server will start without database connectivity.');
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = { server, io };
