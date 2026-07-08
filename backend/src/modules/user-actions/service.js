const UserAction = require('./model');
const User = require('../user-management/user.model');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');

class UserActionsService {
  /**
   * Helper to seed initial dummy data if the collection is empty
   */
  async ensureDummyDataSeeded() {
    const count = await UserAction.countDocuments();
    if (count > 0) return;

    const today = new Date();

    const seededUser = await User.findOne({ email: 'superadmin@retailsync.com' })
      .populate('roleId')
      .populate('branchId')
      .lean();

    const dummyUserId = seededUser?._id || new mongoose.Types.ObjectId();
    const dummyUserName = seededUser ? `${seededUser.firstName} ${seededUser.lastName}` : 'Marcus Chen';
    const dummyRole = seededUser ? seededUser.roleId?.name || 'SUPER_ADMIN' : 'Senior Logistics Lead';
    const dummyBranch = seededUser ? seededUser.branchId?.name || 'Head Office' : 'Seattle Hub - Zone A';

    const dummyLogs = [
      {
        userId: dummyUserId,
        userName: dummyUserName,
        role: dummyRole,
        branch: dummyBranch,
        module: 'Authentication',
        actionType: 'Login',
        description: 'Successful login from authorized IP (192.168.1.144).',
        metadata: { success: true },
        riskLevel: 'Low',
        ipAddress: '192.168.1.144',
        device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        userId: dummyUserId,
        userName: dummyUserName,
        role: dummyRole,
        branch: dummyBranch,
        module: 'Inventory',
        actionType: 'Modification',
        description: "Updated SKU-9021 stock level for branch inventory.",
        metadata: { sku: 'SKU-9021', quantityChange: -5 },
        riskLevel: 'Low',
        ipAddress: '192.168.1.144',
        device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/15.6.1',
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        userId: dummyUserId,
        userName: dummyUserName,
        role: dummyRole,
        branch: dummyBranch,
        module: 'Customer',
        actionType: 'Modification',
        description: "Registered VIP customer Elena Rodriguez in the loyalty program.",
        metadata: { customerName: 'Elena Rodriguez', loyaltyTier: 'VIP' },
        riskLevel: 'Low',
        ipAddress: '192.168.1.144',
        device: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) Mobile/15E148',
        createdAt: new Date(today.getTime() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        userId: dummyUserId,
        userName: dummyUserName,
        role: dummyRole,
        branch: dummyBranch,
        module: 'Supplier',
        actionType: 'Deletion',
        description: "Removed vendor 'Global Tech Sourcing' from supplier list.",
        metadata: { vendorName: 'Global Tech Sourcing' },
        riskLevel: 'High',
        ipAddress: '192.168.1.102',
        device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
        createdAt: new Date(today.getTime() - 11 * 60 * 60 * 1000) // 11 hours ago
      }
    ];

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

    if (filters.userId) {
      query.userId = filters.userId;
    }

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
  async getStats(filters = {}) {
    await this.ensureDummyDataSeeded();

    const baseQuery = filters.userId ? { userId: filters.userId } : {};

    const totalActions = await UserAction.countDocuments(baseQuery);
    
    const totalLogins = await UserAction.countDocuments({
      ...baseQuery,
      $or: [
        { actionType: 'Login' },
        { module: 'Authentication' }
      ]
    });

    const totalModifications = await UserAction.countDocuments({
      ...baseQuery,
      $or: [
        { actionType: 'Modification' },
        { module: { $in: ['Inventory', 'Supplier', 'Customer', 'Product'] } }
      ]
    });

    const totalSecurityAlerts = await UserAction.countDocuments({
      ...baseQuery,
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

  /**
   * Export logs for a specific user (no pagination)
   */
  async exportUserLogs(userId) {
    await this.ensureDummyDataSeeded();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }
    const logs = await UserAction.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    return logs;
  }

  /**
   * Generate PDF export of user logs
   */
  async generatePdfExport(userId) {
    const logs = await this.exportUserLogs(userId);
    
    if (logs.length === 0) {
      throw new Error('No logs found for this user');
    }

    // User info from first log
    const userInfo = logs[0];

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ bufferPages: true });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('User Action Audit Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(1);

        // User Info Section
        doc.fontSize(12).font('Helvetica-Bold').text('User Information', { underline: true });
        doc.fontSize(10).font('Helvetica');
        doc.text(`Name: ${userInfo.userName}`);
        doc.text(`Role: ${userInfo.role}`);
        doc.text(`Branch: ${userInfo.branch}`);
        doc.text(`Total Actions: ${logs.length}`);
        doc.moveDown(1);

        // Activity Summary
        const loginCount = logs.filter(l => l.actionType === 'Login' || l.module === 'Authentication').length;
        const modCount = logs.filter(l => l.actionType === 'Modification').length;
        const deleteCount = logs.filter(l => l.actionType === 'Deletion').length;
        const highRiskCount = logs.filter(l => l.riskLevel === 'High').length;

        doc.fontSize(12).font('Helvetica-Bold').text('Activity Summary', { underline: true });
        doc.fontSize(10).font('Helvetica');
        doc.text(`Logins: ${loginCount}`);
        doc.text(`Modifications: ${modCount}`);
        doc.text(`Deletions: ${deleteCount}`);
        doc.text(`High Risk Actions: ${highRiskCount}`);
        doc.moveDown(1.5);

        // Activity Log
        doc.fontSize(12).font('Helvetica-Bold').text('Activity Log', { underline: true });
        doc.moveDown(0.5);

        // Draw activity entries
        logs.forEach((log, index) => {
          const yPos = doc.y;
          
          // Risk level color indicator
          if (log.riskLevel === 'High') {
            doc.rect(doc.page.margins.left - 10, yPos, 5, 50).fill('#ff4444');
          } else if (log.riskLevel === 'Medium') {
            doc.rect(doc.page.margins.left - 10, yPos, 5, 50).fill('#ffaa00');
          } else {
            doc.rect(doc.page.margins.left - 10, yPos, 5, 50).fill('#00aa44');
          }

          doc.fontSize(10).font('Helvetica-Bold').text(
            `[${new Date(log.createdAt).toLocaleString()}] ${log.actionType}`,
            { continued: true }
          );
          doc.fontSize(9).font('Helvetica').text(` - ${log.module}`);
          
          doc.fontSize(9).font('Helvetica').text(log.description, { width: 450 });
          
          if (log.ipAddress || log.device) {
            doc.fontSize(8).fillColor('#666666');
            if (log.ipAddress) doc.text(`IP: ${log.ipAddress}`);
            if (log.device) doc.text(`Device: ${log.device}`);
            doc.fillColor('#000000');
          }

          if (log.metadata && Object.keys(log.metadata).length > 0) {
            doc.fontSize(8).fillColor('#999999');
            doc.text(`Details: ${JSON.stringify(log.metadata)}`);
            doc.fillColor('#000000');
          }

          doc.moveDown(0.8);

          // Page break if needed
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
          }
        });

        // Footer
        doc.fontSize(8).fillColor('#999999').text(
          'This is a confidential audit report. Unauthorized distribution is prohibited.',
          { align: 'center' }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new UserActionsService();
