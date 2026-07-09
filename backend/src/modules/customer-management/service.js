const Customer = require('./model');

class CustomerService {
  async createCustomer(data) {
    const existingCustomer = await Customer.findOne({ email: data.email });
    if (existingCustomer) {
      const err = new Error('Email already exists');
      err.statusCode = 409;
      throw err;
    }

    const customer = new Customer(data);
    await customer.save();
    return customer.toObject();
  }

  async getCustomers(queryParams) {
    const page = Number(queryParams.page) > 0 ? Number(queryParams.page) : 1;
    const limit = Number(queryParams.limit) > 0 ? Number(queryParams.limit) : 10;
    const search = queryParams.search ? String(queryParams.search).trim() : '';
    const status = queryParams.status ? String(queryParams.status).trim() : '';
    const customerType = queryParams.customerType ? String(queryParams.customerType).trim() : '';
    const sortBy = queryParams.sortBy ? String(queryParams.sortBy).trim() : '';

    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') query.status = status;
    if (customerType && customerType !== 'all') query.customerType = customerType;

    let sort = { createdAt: -1 };
    switch (sortBy) {
      case 'name-asc':
        sort = { firstName: 1, lastName: 1 };
        break;
      case 'name-desc':
        sort = { firstName: -1, lastName: -1 };
        break;
      case 'orders-asc':
        sort = { totalOrders: 1 };
        break;
      case 'orders-desc':
        sort = { totalOrders: -1 };
        break;
      case 'spending-asc':
        sort = { totalSpending: 1 };
        break;
      case 'spending-desc':
        sort = { totalSpending: -1 };
        break;
      case 'recent':
        sort = { updatedAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [customers, totalCount] = await Promise.all([
      Customer.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query),
    ]);

    return {
      customers,
      totalCount,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    };
  }

  async getCustomerById(id) {
    const customer = await Customer.findById(id).lean();
    if (!customer) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      throw err;
    }
    return customer;
  }

  async updateCustomer(id, data) {
    if (data.email) {
      const existingCustomer = await Customer.findOne({
        email: data.email,
        _id: { $ne: id },
      });
      if (existingCustomer) {
        const err = new Error('Email already in use by another customer');
        err.statusCode = 409;
        throw err;
      }
    }

    const customer = await Customer.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!customer) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      throw err;
    }

    return customer;
  }

  async deactivateCustomer(id) {
    const customer = await Customer.findByIdAndUpdate(
      id,
      { status: 'Inactive' },
      { new: true, runValidators: true }
    ).lean();

    if (!customer) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      throw err;
    }

    return customer;
  }

  async getCustomerPurchaseHistory(id) {
    await this.getCustomerById(id);

    // Placeholder: once Sales/Order module exists, query those records here.
    return {
      customerId: id,
      purchaseHistory: [],
    };
  }

  async getCustomerStats() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalCustomers, activeCustomers, newThisMonth, loyaltySum] = await Promise.all([
      Customer.countDocuments({}),
      Customer.countDocuments({ status: 'Active' }),
      Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Customer.aggregate([
        { $group: { _id: null, total: { $sum: '$loyaltyPoints' } } },
      ]),
    ]);

    return {
      totalCustomers,
      activeCustomers,
      newThisMonth,
      totalLoyaltyPoints: loyaltySum[0]?.total || 0,
    };
  }
}

module.exports = new CustomerService();
