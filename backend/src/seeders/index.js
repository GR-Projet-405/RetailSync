require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const env = require('../config/env');
const seedBranches = require('./branch.seeder');  // මෙතන 'branches.seeder' නෙවෙයි 'branch.seeder'
const seedRoles = require('./role.seeder');      // මෙතන 'roles.seeder' නෙවෙයි 'role.seeder'
const seedUsers = require('./user.seeder');      // මෙතන 'users.seeder' නෙවෙයි 'user.seeder'

const runSeeders = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB Connected.');

    console.log('--- Starting Seed Process ---');
    await seedBranches();
    await seedRoles();
    await seedUsers();
    console.log('--- Seed Process Completed Successfully ---');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();