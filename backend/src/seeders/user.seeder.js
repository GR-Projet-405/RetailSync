const User = require('../modules/user-management/user.model');
const Role = require('../modules/role-management/role.model');
const Branch = require('../modules/branch-management/branch.model');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    const roles = await Role.find({});
    if (roles.length === 0) {
      throw new Error('Roles must be seeded before users.');
    }

    const branches = await Branch.find({});
    if (branches.length === 0) {
      throw new Error('Branches must be seeded before users.');
    }

    const hqBranch = branches.find(b => b.code === 'HQ-001') || branches[0];
    
    // Create role map for easy access
    const roleMap = {};
    roles.forEach(r => {
      roleMap[r.name] = r._id;
    });

    const defaultPassword = 'Admin@123';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const usersToSeed = [
      {
        firstName: 'System',
        lastName: 'Admin',
        username: 'superadmin',
        email: 'superadmin@retailsync.com',
        roleId: roleMap['SUPER_ADMIN'],
        branchId: hqBranch._id,
      },
      {
        firstName: 'Platform',
        lastName: 'Admin',
        username: 'admin',
        email: 'admin@retailsync.com',
        roleId: roleMap['ADMIN'],
        branchId: hqBranch._id,
      },
      {
        firstName: 'Branch',
        lastName: 'Manager',
        username: 'manager',
        email: 'manager@retailsync.com',
        roleId: roleMap['BRANCH_MANAGER'],
        branchId: hqBranch._id,
      },
      {
        firstName: 'Inventory',
        lastName: 'Manager',
        username: 'inventory',
        email: 'inventory@retailsync.com',
        roleId: roleMap['INVENTORY_MANAGER'],
        branchId: hqBranch._id,
      },
      {
        firstName: 'Retail',
        lastName: 'Cashier',
        username: 'cashier',
        email: 'cashier@retailsync.com',
        roleId: roleMap['CASHIER'],
        branchId: hqBranch._id,
      },
      {
        firstName: 'Store',
        lastName: 'Employee',
        username: 'employee',
        email: 'employee@retailsync.com',
        roleId: roleMap['EMPLOYEE'],
        branchId: hqBranch._id,
      },
      {
        firstName: 'System',
        lastName: 'Auditor',
        username: 'auditor',
        email: 'auditor@retailsync.com',
        roleId: roleMap['AUDITOR'],
        branchId: hqBranch._id,
      },
    ];

    console.log('Seeding users...');

    for (const userData of usersToSeed) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        // Mongoose pre-save hook normally hashes, but since we are inserting pre-hashed or handling it here:
        // Wait, the pre-save hook in user.model hashes if `isModified('password')`.
        // If we use User.create, the pre-save hook will run. So we should pass plain text here,
        // and let the hook hash it.
        await User.create({
          ...userData,
          password: defaultPassword,
          status: 'ACTIVE',
        });
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('User seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers;
