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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), mode: 'MVC + MongoDB' });
});

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
