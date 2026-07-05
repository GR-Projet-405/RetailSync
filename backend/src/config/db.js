const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');

// Some routers/ISP DNS servers fail to resolve SRV records used by
// mongodb+srv:// URIs. Fall back to public DNS resolvers to avoid
// "querySrv ETIMEOUT" errors during local development.
dns.setServers(['1.1.1.1', '8.8.8.8']);

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