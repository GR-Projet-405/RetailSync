const Branch = require('./branch.model');

class BranchPageService {
  async fetchDetails() {
    return {
      module: 'Branch Management',
      status: 'Under Development',
    };
  }

  async fetchActiveBranches() {
    return Branch.find({ status: 'ACTIVE' })
      .select('_id name code location')
      .sort({ name: 1 });
  }
}

module.exports = new BranchPageService();
