const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn('.env file not found, using environment variables');
}

// Connect to MongoDB
connectDB();

const app = express();

// Middleware - Configure CORS with all possible origins
const allowedOrigins = [
  // Production domains
  'https://www.hsglobalexport.com',
  'https://hsglobalexport.com',
  'https://api.hsglobalexport.com',
  
  // Development domains
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173'
];

console.log('🌍 CORS Configuration:');
console.log('  Environment:', process.env.NODE_ENV);
console.log('  Allowed Origins:', allowedOrigins);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error('❌ CORS blocked origin:', origin);
      console.error('   Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Additional CORS headers middleware as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  }
  next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/currency', require('./routes/currencyRoutes'));
app.use('/api', require('./routes/emailRoutes'));
app.use('/api', require('./routes/paymentRoutes'));
app.use('/api', require('./routes/orderRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes')); // Payment webhooks (PayPal)
app.use('/api/admin', require('./routes/adminRoutes')); // Admin routes
app.use('/api/admin', require('./routes/paymentMonitoringRoutes')); // Payment monitoring routes
app.use('/api/admin/products', require('./routes/adminProductRoutes')); // Admin product management
app.use('/api/blogs', require('./routes/blog')); // Blog routes
app.use('/api/shipping', require('./routes/shipping')); // Shipping routes (Freightos integration)
app.use('/api/contact', require('./routes/contactRoutes')); // Contact form routes
app.use('/api/quotations', require('./routes/quotationRoutes')); // Quotation requests
app.use('/api/leads', require('./routes/leadCaptureRoutes')); // Lead capture from popup
app.use('/api/reviews', require('./routes/reviewRoutes')); // Product reviews
app.use('/api/categories', require('./routes/categoryRoutes')); // Category management
app.use('/api', require('./routes/productRoutes')); // Product routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), mode: 'MVC + MongoDB' });
});

// Global error handler - MUST be after all routes
app.use((err, req, res, next) => {
  // Set CORS headers on error responses
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);

  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

const PORT = process.env.PORT || 3000;

const { initEmailService, closeEmailService } = require('./services/emailService');
const orderCleanupService = require('./services/orderCleanupService');

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Initialize email service
  await initEmailService();
  
  // Start order cleanup service
  try {
    orderCleanupService.start();
  } catch (error) {
    console.error('❌ Failed to start order cleanup service:', error);
  }
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close server to stop accepting new connections
  server.close(async () => {
    console.log('✅ HTTP server closed');

    // Stop order cleanup service
    try {
      orderCleanupService.stop();
    } catch (error) {
      console.error('⚠️ Error stopping cleanup service:', error);
    }

    // Close email service
    await closeEmailService();

    // Close database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
    }

    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
