const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('MongoDB Connection Error: MONGODB_URI is not defined in environment variables');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME || 'retailsync_db',
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
