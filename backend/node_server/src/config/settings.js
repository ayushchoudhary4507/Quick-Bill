require('dotenv').config();

const settings = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/quickbill_db',
  port: parseInt(process.env.PORT) || 8000,
  apiV1Prefix: process.env.API_V1_PREFIX || '/api/v1',
  secretKey: process.env.SECRET_KEY || 'SUPER_SECRET_KEY_CHANGE_ME',
  algorithm: process.env.ALGORITHM || 'HS256',
  accessTokenExpireMinutes: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES) || 1440,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5174',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean),
};

module.exports = settings;
