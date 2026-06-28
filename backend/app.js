const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const shopRoutes = require('./routes/shop');
const requestRoutes = require('./routes/requests');
const quotationRoutes = require('./routes/quotations');
const paymentRoutes = require('./routes/payments');
const settlementRoutes = require('./routes/settlements');
const deliveryRoutes = require('./routes/delivery');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const { apiResponse } = require('./utils/helpers');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Auth-specific rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
});
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Local Shopping Platform API Docs',
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  return apiResponse(res, 200, 'Server is running', {
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Database diagnostic check (temporary; helps verify DB connectivity & schema)
app.get('/api/health/db', async (req, res) => {
  const { sequelize } = require('./models');
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      "SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = :db AND table_name = 'users'",
      { replacements: { db: process.env.DB_NAME } }
    );
    const usersTableExists = Number(rows[0].cnt) > 0;
    let roleCount = null;
    let shopsCount = null;
    if (usersTableExists) {
      const [r] = await sequelize.query('SELECT COUNT(*) AS cnt FROM roles');
      roleCount = Number(r[0].cnt);
      const [s] = await sequelize.query('SELECT COUNT(*) AS cnt FROM shops');
      shopsCount = Number(s[0].cnt);
    }
    return apiResponse(res, 200, 'Database reachable', {
      connected: true,
      usersTableExists,
      roleCount,
      shopsCount,
      seedDemoEnv: process.env.SEED_DEMO_DATA || null,
      demoSeed: req.app.get('demoSeedStatus') || null,
    });
  } catch (error) {
    return apiResponse(res, 500, 'Database check failed', {
      connected: false,
      error: error.message,
      code: error.original ? error.original.code : undefined,
    });
  }
});

// 404 handler
app.use((req, res) => {
  return apiResponse(res, 404, `Route ${req.method} ${req.path} not found`);
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return apiResponse(res, statusCode, message);
});

module.exports = app;
