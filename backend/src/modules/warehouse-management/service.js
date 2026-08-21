const mongoose = require('mongoose');
const Warehouse = require('./model');

class WarehouseManagementService {
  async getWarehouses(filters = {}) {
    const query = {};
    if (filters.branchId) {
      if (mongoose.Types.ObjectId.isValid(filters.branchId)) {
        query.branchId = new mongoose.Types.ObjectId(filters.branchId);
      } else {
        return [];
      }
    }
    return await Warehouse.find(query)
      .populate('branchId')
      .populate('managerId')
      .lean();
  }

  async getWarehouseById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Invalid warehouse ID');
      err.statusCode = 400;
      throw err;
    }
    const warehouse = await Warehouse.findById(id)
      .populate('branchId')
      .populate('managerId')
      .lean();
    if (!warehouse) {
      const err = new Error('Warehouse not found');
      err.statusCode = 404;
      throw err;
    }
    return warehouse;
  }

  async createWarehouse(payload) {
    try {
      return await Warehouse.create(payload);
    } catch (error) {
      if (error.name === 'ValidationError') {
        const err = new Error(error.message);
        err.statusCode = 400;
        throw err;
      }
      if (error.code === 11000) {
        const err = new Error('Warehouse code already exists');
        err.statusCode = 409;
        throw err;
      }
      throw error;
    }
  }

  async getWarehouseLocations(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Invalid warehouse ID');
      err.statusCode = 400;
      throw err;
    }
    const LocationModel = mongoose.models.Location;
    if (LocationModel) {
      return await LocationModel.find({ warehouseId: id }).lean();
    }
    return [];
  }
}

module.exports = new WarehouseManagementService();
