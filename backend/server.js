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

// Middleware - Configure CORS properly
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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
app.use('/api/webhooks', require('./routes/webhookRoutes')); // Razorpay webhooks
app.use('/api/admin', require('./routes/adminRoutes')); // Admin routes
app.use('/api/blogs', require('./routes/blog')); // Blog routes
app.use('/api/shipping', require('./routes/shipping')); // Shipping routes (Freightos integration)
app.use('/api/contact', require('./routes/contactRoutes')); // Contact form routes
app.use('/api/quotations', require('./routes/quotationRoutes')); // Quotation requests
app.use('/api/leads', require('./routes/leadCaptureRoutes')); // Lead capture from popup

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), mode: 'MVC + MongoDB' });
});

const PORT = process.env.PORT || 3000;

const { initEmailService, closeEmailService } = require('./services/emailService');

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Initialize email service
  await initEmailService();
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close server to stop accepting new connections
  server.close(async () => {
    console.log('✅ HTTP server closed');

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
