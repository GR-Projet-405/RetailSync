const Branch = require('../branch-management/branch.model');

const getBranches = async () => {
  const branches = await Branch.find({ status: 'ACTIVE' })
    .select('_id name code location status')
    .sort({ name: 1 })
    .lean();

  return branches;
};

module.exports = { getBranches };