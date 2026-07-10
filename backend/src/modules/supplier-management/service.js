const Supplier = require('./model');

class SupplierService {
  // ─── List all suppliers (with optional filtering) ─────────────────────────
  async listSuppliers({ status, category, search, page = 1, limit = 20 } = {}) {
    const query = {};
    if (status)   query.status = status;
    if (category) query.industryCategory = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { supplierId: { $regex: search, $options: 'i' } },
        { industryCategory: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .select('-payment.accountNumber -payment.routingNumber') // mask sensitive fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Supplier.countDocuments(query),
    ]);
    return { suppliers, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ─── Get single supplier by id ────────────────────────────────────────────
  async getSupplierById(id) {
    const supplier = await Supplier.findById(id)
      .select('-payment.accountNumber -payment.routingNumber');
    if (!supplier) throw Object.assign(new Error('Supplier not found'), { statusCode: 404 });
    return supplier;
  }

  // ─── Create new supplier ──────────────────────────────────────────────────
  async createSupplier(data) {
    const supplier = new Supplier(data);
    await supplier.save();
    return supplier;
  }

  // ─── Update supplier ──────────────────────────────────────────────────────
  async updateSupplier(id, data) {
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-payment.accountNumber -payment.routingNumber');
    if (!supplier) throw Object.assign(new Error('Supplier not found'), { statusCode: 404 });
    return supplier;
  }

  // ─── Delete supplier ──────────────────────────────────────────────────────
  async deleteSupplier(id) {
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) throw Object.assign(new Error('Supplier not found'), { statusCode: 404 });
    return { deleted: true, supplierId: supplier.supplierId };
  }

  // ─── Deactivate supplier (soft delete for Goods Receiving) ──────────────────
  async deactivateSupplier(id) {
    const supplier = await Supplier.findByIdAndUpdate(id, { status: 'Inactive' }, { new: true });
    if (!supplier) throw Object.assign(new Error('Supplier not found'), { statusCode: 404 });
    return supplier;
  }

  // ─── Contacts ─────────────────────────────────────────────────────────────
  async getContacts(supplierId) {
    const supplier = await Supplier.findById(supplierId).select('contacts name supplierId');
    if (!supplier) throw Object.assign(new Error('Supplier not found'), { statusCode: 404 });
    return { supplier: { name: supplier.name, id: supplier.supplierId }, contacts: supplier.contacts };
  }

  async addContact(supplierId, contactData) {
    const supplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { $push: { contacts: contactData } },
      { new: true, runValidators: true }
    ).select('contacts name supplierId');
    if (!supplier) throw Object.assign(new Error('Supplier not found'), { statusCode: 404 });
    return supplier.contacts[supplier.contacts.length - 1];
  }

  async updateContact(supplierId, contactId, data) {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: supplierId, 'contacts._id': contactId },
      { $set: { 'contacts.$': { ...data, _id: contactId } } },
      { new: true }
    ).select('contacts');
    if (!supplier) throw Object.assign(new Error('Contact not found'), { statusCode: 404 });
    return supplier.contacts.id(contactId);
  }

  async deleteContact(supplierId, contactId) {
    await Supplier.findByIdAndUpdate(
      supplierId,
      { $pull: { contacts: { _id: contactId } } }
    );
    return { deleted: true };
  }

  // ─── Performance ──────────────────────────────────────────────────────────
  async getPerformance(supplierId) {
    const supplier = await Supplier.findById(supplierId)
      .select('name supplierId performance rating status');
    if (!supplier) throw Object.assign(new Error('Supplier not found'), { statusCode: 404 });
    return supplier;
  }

  async updatePerformance(supplierId, metricsData) {
    const supplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { $set: { performance: metricsData } },
      { new: true }
    ).select('name supplierId performance');
    if (!supplier) throw Object.assign(new Error('Supplier not found'), { statusCode: 404 });
    return supplier;
  }

  // ─── Summary stats ────────────────────────────────────────────────────────
  async getStats() {
    const [total, active, pending, spend] = await Promise.all([
      Supplier.countDocuments(),
      Supplier.countDocuments({ status: 'Active' }),
      Supplier.countDocuments({ status: 'Pending' }),
      Supplier.aggregate([{ $group: { _id: null, totalSpend: { $sum: '$performance.ytdSpend' } } }]),
    ]);
    return {
      total,
      active,
      pending,
      inactive: total - active - pending,
      totalSpendYTD: spend[0]?.totalSpend ?? 0,
    };
  }
}

module.exports = new SupplierService();
