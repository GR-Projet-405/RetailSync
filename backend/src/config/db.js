const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');

// Some routers/ISP DNS servers fail to resolve SRV records used by
// mongodb+srv:// URIs. Fall back to public DNS resolvers to avoid
// "querySrv ETIMEOUT" errors during local development.
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Global is used here to maintain a cached connection across hot reloads
// in development and serverless function executions in production.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    console.log('MongoDB Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { dbName: 'retailsync_db' };
    cached.promise = mongoose.connect(env.MONGODB_URI, opts).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    }).catch((error) => {
      console.error(`MongoDB Connection Error: ${error.message}`);
      cached.promise = null; // reset promise on failure
      if (env.NODE_ENV === 'production') process.exit(1);
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

module.exports = connectDB;