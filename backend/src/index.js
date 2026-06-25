const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { initWhatsApp } = require('./whatsapp/client');
const flowRoutes = require('./routes/flows');
const contactRoutes = require('./routes/contacts');
const chatRoutes = require('./routes/chats');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files (for cPanel)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// MongoDB Connection (Use MongoDB Atlas for shared hosting)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/whatsapp-crm';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err.message));

// API Routes
app.use('/api/flows', flowRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/chats', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    whatsapp: global.whatsappReady || false,
    uptime: process.uptime()
  });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }
});

// Initialize WhatsApp with Socket.io
initWhatsApp(io);

// Make io accessible globally
global.io = io;

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in browser`);
});
