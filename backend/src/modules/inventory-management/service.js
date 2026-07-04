const Inventory = require('./model');

class InventoryPageService {
  async getBranchInventory(branchId) {
    const filter = {};
    if (branchId) {
      filter.branchId = branchId;
    }
    return await Inventory.find(filter)
      .populate('productId')
      .populate('branchId')
      .lean();
  }
}

module.exports = new InventoryPageService();
