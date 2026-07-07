const Report = require('../modules/reports/model');
const User   = require('../modules/user-management/user.model');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const SAMPLE_REPORTS = [
  {
    name:   'Daily Revenue Summary',
    type:   'SALES',
    status: 'COMPLETED',
    daysAgo: 0,
    metadata: { totalRows: 1240, executionTimeMs: 842, fileSize: '1018.8 KB' },
    filters: { dateFrom: daysAgo(1), dateTo: new Date(), allBranches: true },
  },
  {
    name:   'Monthly Inventory Audit',
    type:   'INVENTORY',
    status: 'COMPLETED',
    daysAgo: 1,
    metadata: { totalRows: 856, executionTimeMs: 614, fileSize: '702.9 KB' },
    filters: { dateFrom: daysAgo(31), dateTo: daysAgo(1), allBranches: true },
  },
  {
    name:   'Yearly Tax Reconciliation',
    type:   'FINANCE',
    status: 'PENDING',
    daysAgo: 1,
    metadata: { totalRows: 0, executionTimeMs: null, fileSize: null },
    filters: { dateFrom: daysAgo(365), dateTo: daysAgo(1), allBranches: true },
  },
  {
    name:   'Staff Efficiency Q3',
    type:   'EMPLOYEE',
    status: 'COMPLETED',
    daysAgo: 2,
    metadata: { totalRows: 48, executionTimeMs: 213, fileSize: '39.4 KB' },
    filters: { dateFrom: daysAgo(92), dateTo: daysAgo(2), allBranches: true },
  },
  {
    name:   'Loyalty Program Engagement',
    type:   'CUSTOMER',
    status: 'COMPLETED',
    daysAgo: 3,
    metadata: { totalRows: 2100, executionTimeMs: 1820, fileSize: '1722.0 KB' },
    filters: { dateFrom: daysAgo(30), dateTo: daysAgo(3), allBranches: true },
  },
  {
    name:   'Weekly Sales Breakdown',
    type:   'SALES',
    status: 'COMPLETED',
    daysAgo: 5,
    metadata: { totalRows: 740, executionTimeMs: 520, fileSize: '607.8 KB' },
    filters: { dateFrom: daysAgo(12), dateTo: daysAgo(5), allBranches: false },
  },
  {
    name:   'Customer Retention Analysis',
    type:   'CUSTOMER',
    status: 'COMPLETED',
    daysAgo: 7,
    metadata: { totalRows: 1540, executionTimeMs: 1340, fileSize: '1262.8 KB' },
    filters: { dateFrom: daysAgo(60), dateTo: daysAgo(7), allBranches: true },
  },
  {
    name:   'Finance Monthly Summary',
    type:   'FINANCE',
    status: 'COMPLETED',
    daysAgo: 10,
    metadata: { totalRows: 320, executionTimeMs: 440, fileSize: '262.4 KB' },
    filters: { dateFrom: daysAgo(40), dateTo: daysAgo(10), allBranches: true },
  },
];

const seedReports = async () => {
  try {
    const existing = await Report.countDocuments();
    if (existing > 0) {
      console.log(`  [Reports] Skipping — ${existing} reports already exist.`);
      return;
    }

    // Find a user to attribute reports to (prefer admin/super-admin)
    const adminUser = await User.findOne({ status: 'ACTIVE' })
      .populate('roleId', 'name')
      .sort({ createdAt: 1 });

    if (!adminUser) {
      console.warn('  [Reports] No active users found — skipping report seed.');
      return;
    }

    const systemUser = await User.findOne({ status: 'ACTIVE' }).sort({ createdAt: 1 });
    const altUser    = await User.findOne({ status: 'ACTIVE' }).sort({ createdAt: -1 });

    // Alternate between two users for variety
    const reportsToInsert = SAMPLE_REPORTS.map((r, i) => {
      const createdAt = daysAgo(r.daysAgo);
      return {
        name:        r.name,
        type:        r.type,
        generatedBy: i % 3 === 0 ? altUser._id : adminUser._id,
        status:      r.status,
        filters:     r.filters,
        metadata:    r.metadata,
        createdAt,
        updatedAt:   createdAt,
      };
    });

    await Report.insertMany(reportsToInsert, { timestamps: false });
    console.log(`  [Reports] Seeded ${reportsToInsert.length} sample reports.`);
  } catch (err) {
    console.error('  [Reports] Seeder failed:', err.message);
    throw err;
  }
};

module.exports = seedReports;
