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

// Seed demo data (shops, customers, requests, orders, etc.) when SEED_DEMO_DATA=true.
// Runs statement-by-statement with INSERT IGNORE + relaxed sql_mode/FK so it is idempotent
// and resilient to the timestamp-default drift caused by sequelize.sync({alter}).
const seedDemoData = async () => {
  if (process.env.SEED_DEMO_DATA !== 'true') {
    app.set('demoSeedStatus', { skipped: 'SEED_DEMO_DATA not true' });
    return;
  }
  try {
    const seedPath = path.join(__dirname, 'database', 'seed.sql');
    if (!fs.existsSync(seedPath)) {
      app.set('demoSeedStatus', { error: 'seed.sql not found' });
      return;
    }
    console.log('Seeding demo data (resilient mode)...');
    let raw = fs.readFileSync(seedPath, 'utf8');
    const validHash = bcrypt.hashSync('password123', 10);
    raw = raw.split('$2a$10$xVqYLGwYZ0GHX5PmGJdqY.EtGKb5VZwPvFKjp8VGKfJ8OxB3dC6Oe').join(validHash);

    // Strip comment lines, then split into individual statements.
    const statements = raw
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !/^SET\s/i.test(s));

    // Reset rating/review demo tables (no natural unique key) so re-runs stay clean.
    try { await sequelize.query("SET SESSION FOREIGN_KEY_CHECKS=0; DELETE FROM reviews; DELETE FROM ratings;"); } catch (e) { /* ignore */ }

    let ok = 0;
    const failed = [];
    for (let stmt of statements) {
      stmt = stmt.replace(/^INSERT\s+INTO/i, 'INSERT IGNORE INTO');
      try {
        await sequelize.query(`SET SESSION sql_mode=''; SET SESSION FOREIGN_KEY_CHECKS=0; ${stmt};`);
        ok += 1;
      } catch (e) {
        failed.push({ stmt: stmt.slice(0, 50), error: e.message });
      }
    }

    // Backfill any zero/empty timestamps produced while strict mode was off.
    const tables = ['users', 'customers', 'shops', 'shop_keywords', 'delivery_agents',
      'delivery_boys', 'service_areas', 'customer_requests', 'quotations', 'quotation_items',
      'payment_transactions', 'delivery_assignments', 'cash_collections', 'notifications'];
    for (const t of tables) {
      for (const col of ['created_at', 'updated_at']) {
        try {
          await sequelize.query(`UPDATE ${t} SET ${col}=NOW() WHERE ${col} IS NULL OR ${col} < '1971-01-01 00:00:00'`);
        } catch (e) { /* column may not exist; ignore */ }
      }
    }

    const [s] = await sequelize.query('SELECT COUNT(*) AS cnt FROM shops');
    const [rq] = await sequelize.query('SELECT COUNT(*) AS cnt FROM customer_requests');
    console.log(`Demo seed done. ok=${ok} failed=${failed.length} shops=${s[0].cnt} requests=${rq[0].cnt}`);
    app.set('demoSeedStatus', {
      ok,
      failedCount: failed.length,
      failed: failed.slice(0, 6),
      shops: Number(s[0].cnt),
      requests: Number(rq[0].cnt),
    });
  } catch (error) {
    console.error('Demo data seed failed:', error.message);
    app.set('demoSeedStatus', { error: error.message });
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
