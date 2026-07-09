const AuditLog = require('../modules/audit-logs/model');
const fs = require('fs');
const path = require('path');

const seedAuditLogs = async () => {
  try {
    console.log('Seeding audit logs...');
    
    // Clear existing audit logs to ensure fresh data
    await AuditLog.deleteMany({});
    console.log('Cleared existing audit logs.');

    // Load sample data from JSON file
    const sampleDataPath = path.join(__dirname, '../modules/audit-logs/sampleData.json');
    const rawData = fs.readFileSync(sampleDataPath, 'utf8');
    const sampleLogs = JSON.parse(rawData);
    
    // Convert timestamp strings to Date objects
    const logsToInsert = sampleLogs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }));

    // Insert sample data
    await AuditLog.insertMany(logsToInsert);
    
    console.log(`Successfully seeded ${logsToInsert.length} audit logs.`);
  } catch (error) {
    console.error('Error seeding audit logs:', error);
    throw error;
  }
};

module.exports = seedAuditLogs;
