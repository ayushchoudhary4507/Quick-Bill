const express = require('express');
const cors = require('cors');
const settings = require('./config/settings');

// Route imports
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const checkoutRoutes = require('./routes/checkout');
const salesRoutes = require('./routes/sales');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payment');

const app = express();

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: settings.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
  })
);

// ─── Body Parsers ────────────────────────────────────────────────────────────
// Stripe webhook needs raw body — must be placed BEFORE json parser for /webhook
app.use((req, res, next) => {
  if (req.originalUrl.includes('/payments/webhook')) {
    next(); // raw body handled in payment router
  } else {
    express.json()(req, res, next);
  }
});

// Support URL-encoded form bodies (for auth/login form-data)
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
const prefix = settings.apiV1Prefix; // /api/v1

app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/products`, productsRoutes);
app.use(`${prefix}/checkout`, checkoutRoutes);
app.use(`${prefix}/sales`, salesRoutes);
app.use(`${prefix}/analytics`, analyticsRoutes);
app.use(`${prefix}/payments`, paymentRoutes);

// Stripe webhook also exposed at /stripe/webhook (mirrors Python)
app.use('/stripe', paymentRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'node-express' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ detail: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({ detail: err.message || 'Internal server error' });
});

module.exports = app;
