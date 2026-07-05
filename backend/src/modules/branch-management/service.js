const Branch = require('./branch.model');

class BranchPageService {
  async getAllBranches() {
    return await Branch.find({ status: 'ACTIVE' }).sort({ name: 1 });
  }
}

module.exports = new BranchPageService();
