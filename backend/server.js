const http = require('http');
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

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
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
