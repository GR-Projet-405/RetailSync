const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');

// Windows DNS client does not forward SRV queries to Node.js properly.
// Force Node.js to use Google's public DNS so mongodb+srv:// URIs resolve.
if (process.platform === 'win32') {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, { dbName: 'retailsync_db' });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Allow server to run even if MongoDB isn't running locally in dev mode
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;