const Branch = require('../modules/branch-management/branch.model');

const seedBranches = async () => {
  try {
    const branchesToSeed = [
      {
        name: 'Main Branch HQ',
        code: 'HQ-001',
        location: {
          address: '123 Retail Ave',
          city: 'Metropolis',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        contactPhone: '+1-555-0100',
        contactEmail: 'hq@retailsync.com',
        status: 'ACTIVE',
      },
      {
        name: 'Downtown Store',
        code: 'DT-002',
        location: {
          address: '456 Market St',
          city: 'Metropolis',
          state: 'NY',
          zipCode: '10002',
          country: 'USA',
        },
        contactPhone: '+1-555-0101',
        contactEmail: 'downtown@retailsync.com',
        status: 'ACTIVE',
      },
      {
        name: 'Westside Outlet',
        code: 'WS-003',
        location: {
          address: '789 Outlet Blvd',
          city: 'Metropolis',
          state: 'NY',
          zipCode: '10003',
          country: 'USA',
        },
        contactPhone: '+1-555-0102',
        contactEmail: 'westside@retailsync.com',
        status: 'ACTIVE',
      },
    ];

    console.log('Seeding branches...');
    
    for (const branchData of branchesToSeed) {
      const existingBranch = await Branch.findOne({ code: branchData.code });
      if (!existingBranch) {
        await Branch.create(branchData);
        console.log(`Created branch: ${branchData.name}`);
      } else {
        console.log(`Branch already exists: ${branchData.name}`);
      }
    }
    
    console.log('Branch seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding branches:', error);
    throw error;
  }
};

module.exports = seedBranches;
