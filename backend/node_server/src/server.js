require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const settings = require('./config/settings');

// Ensure all models are initialized
require('./models/index');

async function startServer() {
  // Connect to MongoDB Atlas
  await connectDB();

  app.listen(settings.port, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║       Quick-Bill Node.js + Express Backend       ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  ✅ Server running on: http://localhost:${settings.port}    ║`);
    console.log(`║  📡 API prefix:        ${settings.apiV1Prefix}                ║`);
    console.log(`║  🍃 Database:          MongoDB Atlas connected    ║`);
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

