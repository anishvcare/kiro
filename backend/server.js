const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');
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
