const Supplier = require('./model');

class SupplierService {
  async getSuppliers(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };

    return Supplier.find(filter).sort({ name: 1 });
  }

  async getSupplierById(id) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      const error = new Error('Supplier not found.');
      error.statusCode = 404;
      throw error;
    }
    return supplier;
  }

  async createSupplier(payload) {
    if (!payload.name) {
      const error = new Error('Supplier name is required.');
      error.statusCode = 400;
      throw error;
    }
    return Supplier.create(payload);
  }

  async updateSupplier(id, payload) {
    const supplier = await Supplier.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!supplier) {
      const error = new Error('Supplier not found.');
      error.statusCode = 404;
      throw error;
    }
    return supplier;
  }

  // Soft delete - keeps historical goods receipts / purchase orders pointing at a valid supplier
  async deactivateSupplier(id) {
    const supplier = await Supplier.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
    if (!supplier) {
      const error = new Error('Supplier not found.');
      error.statusCode = 404;
      throw error;
    }
    return supplier;
  }
}

module.exports = new SupplierService();
