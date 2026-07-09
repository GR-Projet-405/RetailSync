require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const env = require('../config/env');
const seedAuditLogs = require('./auditLogs.seeder');

const runAuditLogsSeeder = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI, { dbName: 'retailsync_db' });
    console.log('MongoDB Connected.');

    console.log('--- Starting Audit Logs Seed Process ---');
    await seedAuditLogs();
    console.log('--- Audit Logs Seed Process Completed Successfully ---');

    process.exit(0);
  } catch (error) {
    console.error('Audit logs seeding failed:', error);
    process.exit(1);
  }
};

runAuditLogsSeeder();
