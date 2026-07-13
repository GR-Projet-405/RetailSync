require('dotenv').config({ path: '../../../.env' });
const mongoose = require('mongoose');
const env = require('../config/env');
const seedRoles = require('./roles.seeder');

const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB Connected.');

    await seedRoles();

    process.exit(0);
  } catch (error) {
    console.error('Roles seeding failed:', error);
    process.exit(1);
  }
};

run();
