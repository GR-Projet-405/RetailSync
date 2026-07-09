const Role = require('../modules/role-management/role.model');
const { ALL_PERMISSIONS } = require('../config/permissions');

const seedRoles = async () => {
  try {
    const systemRoles = [
      {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with all permissions',
        permissions: ALL_PERMISSIONS,
        isSystemRole: true,
      },
      {
        name: 'ADMIN',
        description: 'System Administrator with most permissions',
        permissions: ALL_PERMISSIONS, // Simplified for now, can be restricted later
        isSystemRole: true,
      },
<<<<<<< HEAD:backend/src/seeders/roles.seeder.js
     {
  name: 'BRANCH_MANAGER',
  description: 'Manager of a specific branch',
  permissions: [
    'users.view',
    'users.create',
    'users.edit',
    'products.view',
    'inventory.view',
    'inventory.manage',
    'sales.view',
    'sales.manage',
    'reports.view',
    'roles.view',
    'branches.view',
  ],
  isSystemRole: true,
},
=======
      {
        name: 'BRANCH_MANAGER',
        description: 'Manager of a specific branch',
        permissions: [
          'users.view', 'products.view', 'inventory.view', 'inventory.manage', 'sales.view', 'sales.manage', 'reports.view', 'branches.view'
        ],
        isSystemRole: true,
      },
>>>>>>> origin/dev:backend/src/seeders/role.seeder.js
      {
        name: 'INVENTORY_MANAGER',
        description: 'Manager of warehouse and stock',
        permissions: [
          'products.view', 'products.create', 'products.edit', 'inventory.view', 'inventory.manage'
        ],
        isSystemRole: true,
      },
      {
        name: 'CASHIER',
        description: 'POS Operator',
        permissions: [
          'products.view', 'sales.view', 'sales.manage'
        ],
        isSystemRole: true,
      },
      {
        name: 'EMPLOYEE',
        description: 'Standard branch employee',
        permissions: [
          'products.view'
        ],
        isSystemRole: true,
      },
      {
        name: 'AUDITOR',
        description: 'Read-only access for auditing',
        permissions: [
          'users.view', 'roles.view', 'products.view', 'inventory.view', 'branches.view', 'reports.view', 'auditlogs.view', 'dashboard.view', 'sales.view'
        ],
        isSystemRole: true,
      },
    ];

    console.log('Seeding roles...');

    for (const roleData of systemRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.name}`);
      } else {
        // Update permissions if role already exists
        await Role.updateOne({ _id: existingRole._id }, { $set: { permissions: roleData.permissions } });
        console.log(`Updated permissions for role: ${roleData.name}`);
      }
    }

    console.log('Role seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  }
};

module.exports = seedRoles;
