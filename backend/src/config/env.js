const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Configure DNS fallback/resolution for MongoDB SRV records (fixes querySrv ECONNREFUSED in local/restricted environments)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('Warning: Could not set DNS servers, default resolver will be used.', err.message);
}

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/retailsync_db',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkeyforretailsyncpos2026',

  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};
