const Role = require('./role.model');

const getAllRoles = async () => {
  return await Role.find({}).sort({ createdAt: 1 });
};

const getRoleById = async (id) => {
  return await Role.findById(id);
};

const createRole = async (roleData) => {
  // Ensure we don't accidentally create a system role via API
  const { name, description, permissions } = roleData;
  const role = new Role({
    name,
    description,
    permissions,
    isSystemRole: false,
  });
  return await role.save();
};

const updateRole = async (id, roleData) => {
  const role = await Role.findById(id);
  if (!role) return null;

  if (role.isSystemRole) {
    throw new Error('System roles cannot be modified.');
  }

  const { name, description, permissions } = roleData;
  role.name = name || role.name;
  role.description = description || role.description;
  if (permissions) {
    role.permissions = permissions;
  }

  return await role.save();
};

const deleteRole = async (id) => {
  const role = await Role.findById(id);
  if (!role) return null;

  if (role.isSystemRole) {
    throw new Error('System roles cannot be deleted.');
  }

  return await Role.findByIdAndDelete(id);
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
