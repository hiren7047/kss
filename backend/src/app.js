const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { corsOrigin } = require('./config/env');
const requestLogger = require('./middlewares/requestLogger');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const donationRoutes = require('./routes/donationRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eventItemRoutes = require('./routes/eventItemRoutes');
const eventExpensePlanRoutes = require('./routes/eventExpensePlanRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const walletRoutes = require('./routes/walletRoutes');
const documentRoutes = require('./routes/documentRoutes');
const auditRoutes = require('./routes/auditRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const publicRoutes = require('./routes/publicRoutes');
const formRoutes = require('./routes/formRoutes');
const publicFormRoutes = require('./routes/publicFormRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  corsOrigin,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Allow local network IPs
  /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/, // Allow private network IPs
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      // In development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
const path = require('path');
const { uploadDir } = require('./config/env');
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Public API routes (no auth required)
app.use('/api/public', publicRoutes);
app.use('/api/forms/public', publicFormRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-items', eventItemRoutes);
app.use('/api/event-expense-plans', eventExpensePlanRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/forms', formRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;


