const mongoose = require('mongoose');
const dns = require('dns');
const settings = require('./settings');

// Set Google/Cloudflare DNS servers to resolve MongoDB Atlas SRV records reliably
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e.message);
}

async function connectDB() {
  try {
    await mongoose.connect(settings.databaseUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅  ayush MongoDB connected successfully');
    console.log(`   DB: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = { mongoose, connectDB };
