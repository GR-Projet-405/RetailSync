const dns = require('dns');
// Windows DNS client blocks SRV queries from Node.js; use Google DNS instead.
if (process.platform === 'win32') dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const env = require('../config/env');
const seedBranches = require('./branch.seeder');
const seedRoles = require('./role.seeder');
const seedUsers = require('./user.seeder');
const seedSuppliers = require('./suppliers.seeder');
const seedReports              = require('./reports.seeder');
const seedProductsAndInventory = require('./productsAndInventory.seeder');

const runSeeders = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI, { dbName: 'retailsync_db' });
    console.log('MongoDB Connected.');

    console.log('--- Starting Seed Process ---');
    await seedBranches();
    await seedRoles();
    await seedUsers();
    await seedSuppliers();
    await seedReports();
    await seedProductsAndInventory();
    console.log('--- Seed Process Completed Successfully ---');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();
