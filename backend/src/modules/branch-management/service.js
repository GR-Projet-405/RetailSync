const Branch = require('./branch.model');

class BranchPageService {
  async fetchDetails() {
    return {
      module: 'Branch Management',
      status: 'Under Development',
    };
  }

  async getAllBranches() {
    return await Branch.find({ status: 'ACTIVE' }).sort({ name: 1 });
  }

  async fetchActiveBranches() {
    return Branch.find({ status: 'ACTIVE' })
      .select('_id name code location')
      .sort({ name: 1 });
  }
}

module.exports = new BranchPageService();
