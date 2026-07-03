const UserAction = require('./model');
const mongoose = require('mongoose');

class UserActionsService {
  /**
   * Helper to seed initial dummy data if the collection is empty
   */
  async ensureDummyDataSeeded() {
    const count = await UserAction.countDocuments();
    if (count > 0) return;

    // Create a dummy userId to represent Marcus Chen
    const dummyUserId = new mongoose.Types.ObjectId();
    const today = new Date();

    const dummyLogs = [
      {
        userId: dummyUserId,
        userName: 'Marcus Chen',
        role: 'Senior Logistics Lead',
        branch: 'Seattle Hub - Zone A',
        module: 'Inventory',
        actionType: 'Modification',
        description: "Modified quantity for 'Premium OLED Panel' at Branch: Downtown Core. Corrected shipment variance.",
        metadata: { sku: 'SKU-9021', quantityChange: -5, reason: 'Shipment variance correction' },
        riskLevel: 'Low',
        ipAddress: '192.168.1.144',
        device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        userId: dummyUserId,
        userName: 'Marcus Chen',
        role: 'Senior Logistics Lead',
        branch: 'Seattle Hub - Zone A',
        module: 'Authentication',
        actionType: 'Login',
        description: 'Successful login from authorized IP (192.168.1.144). Branch: Remote Office.',
        metadata: { success: true },
        riskLevel: 'Low',
        ipAddress: '192.168.1.144',
        device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/15.6.1',
        createdAt: new Date(today.getTime() - 8 * 60 * 60 * 1000) // 8 hours ago
      },
      {
        userId: dummyUserId,
        userName: 'Marcus Chen',
        role: 'Senior Logistics Lead',
        branch: 'Seattle Hub - Zone A',
        module: 'Supplier',
        actionType: 'Deletion',
        description: "Permanently removed 'Global Tech Sourcing' from primary vendor list. Branch: Headquarters.",
        metadata: { vendorName: 'Global Tech Sourcing', requiresVerification: true },
        riskLevel: 'High',
        ipAddress: '192.168.1.102',
        device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
        createdAt: new Date(today.getTime() - 20 * 60 * 60 * 1000) // 20 hours ago
      },
      {
        userId: dummyUserId,
        userName: 'Marcus Chen',
        role: 'Senior Logistics Lead',
        branch: 'Seattle Hub - Zone A',
        module: 'Customer',
        actionType: 'Modification',
        description: "Registered new VIP loyalty account for 'Elena Rodriguez'. Branch: Downtown Core.",
        metadata: { customerName: 'Elena Rodriguez', loyaltyTier: 'VIP' },
        riskLevel: 'Low',
        ipAddress: '192.168.1.144',
        device: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) Mobile/15E148',
        createdAt: new Date(today.getTime() - 25 * 60 * 60 * 1000) // 25 hours ago
      },
      {
        userId: dummyUserId,
        userName: 'Marcus Chen',
        role: 'Senior Logistics Lead',
        branch: 'Seattle Hub - Zone A',
        module: 'Authentication',
        actionType: 'Login',
        description: 'Failed login attempt. Invalid password entered.',
        metadata: { loginAttempts: 3 },
        riskLevel: 'Medium',
        ipAddress: '185.220.101.5',
        device: 'Unknown Device',
        createdAt: new Date(today.getTime() - 36 * 60 * 60 * 1000) // 36 hours ago
      }
    ];

    // Seed some general activities to make total statistics look realistic
    for (let i = 0; i < 10; i++) {
      dummyLogs.push({
        userId: dummyUserId,
        userName: 'Marcus Chen',
        role: 'Senior Logistics Lead',
        branch: 'Seattle Hub - Zone A',
        module: 'Authentication',
        actionType: 'Login',
        description: `Successful login from authorized IP (192.168.1.144).`,
        metadata: { success: true },
        riskLevel: 'Low',
        ipAddress: '192.168.1.144',
        device: 'Chrome / Windows',
        createdAt: new Date(today.getTime() - (i + 2) * 24 * 60 * 60 * 1000)
      });
    }

    for (let i = 0; i < 16; i++) {
      dummyLogs.push({
        userId: dummyUserId,
        userName: 'Marcus Chen',
        role: 'Senior Logistics Lead',
        branch: 'Seattle Hub - Zone A',
        module: 'Inventory',
        actionType: 'Modification',
        description: `Updated product quantity levels for SKU-100${i}.`,
        metadata: { sku: `SKU-100${i}`, prevStock: 50, newStock: 80 },
        riskLevel: 'Low',
        ipAddress: '192.168.1.144',
        device: 'Chrome / Windows',
        createdAt: new Date(today.getTime() - (i + 3) * 12 * 60 * 60 * 1000)
      });
    }

    for (let i = 0; i < 3; i++) {
      dummyLogs.push({
        userId: dummyUserId,
        userName: 'Marcus Chen',
        role: 'Senior Logistics Lead',
        branch: 'Seattle Hub - Zone A',
        module: 'Authentication',
        actionType: 'Security Alert',
        description: `Security alert: Multiple failed authentication attempts from IP 185.220.101.5.`,
        metadata: { blockedIp: '185.220.101.5', attemptCount: 5 },
        riskLevel: 'High',
        ipAddress: '185.220.101.5',
        device: 'Unknown Browser',
        createdAt: new Date(today.getTime() - (i + 4) * 24 * 60 * 60 * 1000)
      });
    }

    await UserAction.insertMany(dummyLogs);
    console.log('Seeded initial dummy user action logs successfully.');
  }

  /**
   * Create a new user action log
   */
  async createLog(data) {
    return await UserAction.create(data);
  }

  /**
   * Fetch user action logs with advanced filtering
   */
  async getLogs(filters = {}) {
    await this.ensureDummyDataSeeded();

    const query = {};

    // Search filter across description, userName, actionType, module
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { description: searchRegex },
        { userName: searchRegex },
        { actionType: searchRegex },
        { module: searchRegex }
      ];
    }

    // Module filter
    if (filters.module && filters.module !== 'All' && filters.module !== 'All Modules') {
      query.module = filters.module;
    }

    // Risk level filter
    if (filters.riskLevel && filters.riskLevel !== 'All') {
      query.riskLevel = filters.riskLevel;
    }

    // Date range filter (startDate, endDate)
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Pagination variables
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await UserAction.countDocuments(query);
    const logs = await UserAction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      logs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Retrieve a single audit log
   */
  async getLogById(id) {
    await this.ensureDummyDataSeeded();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid audit log ID format');
    }
    const log = await UserAction.findById(id).lean();
    if (!log) {
      throw new Error('Audit log not found');
    }
    return log;
  }

  /**
   * Return aggregated stats of logs
   */
  async getStats() {
    await this.ensureDummyDataSeeded();

    const totalActions = await UserAction.countDocuments();
    
    const totalLogins = await UserAction.countDocuments({
      $or: [
        { actionType: 'Login' },
        { module: 'Authentication' }
      ]
    });

    const totalModifications = await UserAction.countDocuments({
      $or: [
        { actionType: 'Modification' },
        { module: { $in: ['Inventory', 'Supplier', 'Customer', 'Product'] } }
      ]
    });

    const totalSecurityAlerts = await UserAction.countDocuments({
      $or: [
        { riskLevel: 'High' },
        { actionType: 'Security Alert' }
      ]
    });

    return {
      totalActions,
      totalLogins,
      totalModifications,
      totalSecurityAlerts
    };
  }
}

module.exports = new UserActionsService();
