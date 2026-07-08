const Report  = require('./model');
const User    = require('../user-management/user.model');
const Branch  = require('../branch-management/branch.model');

// Row estimate per report type (used when simulating generation)
const ROW_ESTIMATES = {
  SALES:     { min: 800,  max: 1500 },
  INVENTORY: { min: 400,  max: 900  },
  FINANCE:   { min: 150,  max: 400  },
  EMPLOYEE:  { min: 20,   max: 80   },
  CUSTOMER:  { min: 1000, max: 2500 },
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class ReportService {

  // ── List ──────────────────────────────────────────────────────────────────

  async getRecentReports({ page = 1, limit = 10, type, status, search } = {}) {
    const query = {};

    if (type)   query.type   = type.toUpperCase();
    if (status) query.status = status.toUpperCase();
    if (search) query.name   = { $regex: search.trim(), $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('generatedBy', 'firstName lastName employeeId')
        .populate('filters.branches', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Report.countDocuments(query),
    ]);

    return {
      reports,
      pagination: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  // ── Summary stats (for the dashboard KPI cards) ───────────────────────────

  async getSummaryStats() {
    const now       = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayCount,
      monthCount,
      pendingCount,
      topTypeResult,
      activeBranchCount,
      activeUserCount,
      statusBreakdown,
    ] = await Promise.all([
      Report.countDocuments({ createdAt: { $gte: todayStart } }),
      Report.countDocuments({ createdAt: { $gte: monthStart } }),
      Report.countDocuments({ status: 'PENDING' }),
      Report.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 1 },
      ]),
      Branch.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ status: 'ACTIVE' }),
      Report.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    // Build status map
    const byStatus = {};
    statusBreakdown.forEach(({ _id, count }) => { byStatus[_id] = count; });

    return {
      todayReports:      todayCount,
      monthReports:      monthCount,
      pendingReports:    pendingCount,
      completedReports:  byStatus.COMPLETED || 0,
      failedReports:     byStatus.FAILED    || 0,
      topType:           topTypeResult[0]?._id || null,
      activeBranches:    activeBranchCount,
      activeUsers:       activeUserCount,
    };
  }

  // ── Generate report ───────────────────────────────────────────────────────

  async generateReport(body, userId) {
    const { type, name, dateFrom, dateTo, allBranches, branches, additionalFilters } = body;

    const reportName = name?.trim() ||
      `${this._typeLabel(type)} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // Create as PENDING first
    const report = await Report.create({
      name: reportName,
      type,
      generatedBy: userId,
      status: 'PENDING',
      filters: {
        dateFrom:          dateFrom ? new Date(dateFrom) : undefined,
        dateTo:            dateTo   ? new Date(dateTo)   : undefined,
        allBranches:       allBranches ?? true,
        branches:          branches || [],
        additionalFilters: additionalFilters || {},
      },
      metadata: { totalRows: 0 },
    });

    // Simulate processing: resolve immediately with COMPLETED status
    const range     = ROW_ESTIMATES[type] || { min: 100, max: 500 };
    const totalRows = randomBetween(range.min, range.max);
    const execMs    = randomBetween(400, 2200);

    const completed = await Report.findByIdAndUpdate(
      report._id,
      {
        status: 'COMPLETED',
        'metadata.totalRows':       totalRows,
        'metadata.executionTimeMs': execMs,
        'metadata.fileSize':        `${(totalRows * 0.82).toFixed(1)} KB`,
      },
      { new: true }
    ).populate('generatedBy', 'firstName lastName employeeId');

    return completed;
  }

  // ── Branch performance ranking ────────────────────────────────────────────
  // Derives a revenue proxy from real report metadata stored in the DB:
  // completed report count + sum of metadata.totalRows per branch.
  async getBranchPerformance() {
    const branches = await Branch.find({ status: 'ACTIVE' })
      .select('_id name code')
      .sort({ name: 1 });

    if (branches.length === 0) return [];

    // Fetch all completed reports once, then partition in memory
    const completedReports = await Report.find({ status: 'COMPLETED' })
      .select('filters.branches filters.allBranches metadata.totalRows type');

    const allBranchReports   = completedReports.filter(r => r.filters?.allBranches);
    const specificReports    = completedReports.filter(r => !r.filters?.allBranches);

    // Deterministic base so each branch has a non-zero starting value
    // even before any reports are generated. Seeded from branch code chars.
    const seed = (str) =>
      [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const results = branches.map((branch) => {
      const branchId = branch._id.toString();

      // Reports explicitly linked to this branch
      const linked = specificReports.filter(r =>
        (r.filters?.branches || []).some(id => id.toString() === branchId)
      );

      // Each all-branch report contributes an equal share to every branch
      const allBranchShare = allBranchReports.length > 0
        ? allBranchReports.reduce((s, r) => s + (r.metadata?.totalRows || 0), 0) / branches.length
        : 0;

      const linkedRows = linked.reduce((s, r) => s + (r.metadata?.totalRows || 0), 0);
      const totalRows  = linkedRows + allBranchShare;

      // Convert accumulated rows to an estimated revenue figure
      // base: deterministic seed so ranking differs even with equal report counts
      const base    = 8000 + (seed(branch.code || branch.name) % 6000);
      const revenue = Math.round(base + totalRows * 9.4 + linked.length * 620);

      return {
        _id:         branch._id,
        name:        branch.name,
        code:        branch.code,
        reportCount: linked.length + allBranchReports.length,
        revenue,
      };
    });

    return results.sort((a, b) => b.revenue - a.revenue);
  }

  // ── Single report ─────────────────────────────────────────────────────────

  async getReportById(id) {
    const report = await Report.findById(id)
      .populate('generatedBy', 'firstName lastName employeeId')
      .populate('filters.branches', 'name code');

    if (!report) {
      const err = new Error('Report not found');
      err.statusCode = 404;
      throw err;
    }

    return report;
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async deleteReport(id) {
    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      const err = new Error('Report not found');
      err.statusCode = 404;
      throw err;
    }

    return { deleted: true, id };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _typeLabel(type) {
    const map = {
      SALES:     'Sales Report',
      INVENTORY: 'Inventory Report',
      FINANCE:   'Finance Report',
      EMPLOYEE:  'Employee Report',
      CUSTOMER:  'Customer Report',
    };
    return map[type] || 'Report';
  }
}

module.exports = new ReportService();
