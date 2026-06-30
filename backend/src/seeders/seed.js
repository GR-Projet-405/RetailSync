require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const env = require('../config/env');
const seedBranches = require('./branches.seeder');
const seedRoles    = require('./roles.seeder');
const seedUsers    = require('./users.seeder');
const seedReports  = require('./reports.seeder');

const runSeeders = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB Connected.');

    console.log('--- Starting Seed Process ---');
    await seedBranches();
    await seedRoles();
    await seedUsers();
    await seedReports();
    console.log('--- Seed Process Completed Successfully ---');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();
