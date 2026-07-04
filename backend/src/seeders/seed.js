require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const env = require('../config/env');
const seedBranches = require('./branch.seeder');
const seedRoles = require('./role.seeder');
const seedUsers = require('./user.seeder');
const seedProductsAndInventory = require('./productsAndInventory.seeder');

const runSeeders = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB Connected.');

    console.log('--- Starting Seed Process ---');
    await seedBranches();
    await seedRoles();
    await seedUsers();
    await seedProductsAndInventory();
    console.log('--- Seed Process Completed Successfully ---');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();
