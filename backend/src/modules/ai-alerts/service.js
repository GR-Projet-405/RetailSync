const mongoose = require('mongoose');
const AIAlert = require('./model');
const BusinessAnalyticsSnapshot = require('../business-analytics/model');

const DAY_MS = 24 * 60 * 60 * 1000;

// ─── Helper: generate unique alert ID ───
let alertCounter = 100;
const nextAlertId = () => {
  alertCounter += 1;
  return `AL-${alertCounter}`;
};

// ─── Get all alerts with filtering ───
const getAlerts = async (filters = {}) => {
  const query = {};

  if (filters.category && filters.category !== 'all') {
    if (filters.category === 'resolved') {
      query.acknowledged = true;
    } else {
      query.category = filters.category;
      query.acknowledged = false;
    }
  } else if (!filters.includeResolved) {
    // Default: include all
  }

  if (filters.severity && filters.severity !== 'all') {
    query.severity = filters.severity;
  }

  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 50);
  const skip = (page - 1) * limit;

  const [alerts, total] = await Promise.all([
    AIAlert.find(query)
      .populate('acknowledgedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AIAlert.countDocuments(query),
  ]);

  // Compute overview counts
  const allAlerts = await AIAlert.find({});
  const overview = {
    activeAlerts: allAlerts.filter((a) => !a.acknowledged).length,
    lowStockCount: allAlerts.filter((a) => a.category === 'low_stock' && !a.acknowledged).length,
    anomalyCount: allAlerts.filter((a) => a.category === 'anomaly' && !a.acknowledged).length,
    salesTargetCount: allAlerts.filter((a) => a.category === 'sales_target' && !a.acknowledged).length,
  };

  return {
    alerts,
    overview,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get single alert ───
const getAlertById = async (id) => {
  const alert = await AIAlert.findById(id).populate('acknowledgedBy', 'firstName lastName');
  if (!alert) {
    const err = new Error('Alert not found');
    err.statusCode = 404;
    throw err;
  }
  return alert;
};

// ─── Acknowledge (resolve) an alert ───
const acknowledgeAlert = async (id, userId) => {
  const alert = await AIAlert.findByIdAndUpdate(
    id,
    {
      acknowledged: true,
      acknowledgedBy: userId || null,
      acknowledgedAt: new Date(),
    },
    { new: true }
  );

  if (!alert) {
    const err = new Error('Alert not found');
    err.statusCode = 404;
    throw err;
  }

  return alert;
};

// ─── Delete an alert ───
const deleteAlert = async (id) => {
  const alert = await AIAlert.findByIdAndDelete(id);
  if (!alert) {
    const err = new Error('Alert not found');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true, id };
};

// ─── Auto-generate alerts by scanning data ───
const generateAlerts = async () => {
  const generated = [];

  // 1. Scan inventory for low stock projections
  const recentSnapshots = await BusinessAnalyticsSnapshot.find({})
    .sort({ snapshotDate: -1 })
    .limit(5);

  if (recentSnapshots.length > 0) {
    const latestProducts = recentSnapshots[0].products || [];
    for (const product of latestProducts) {
      if (
        product.inventoryStatus === 'LOW_STOCK' ||
        product.inventoryStatus === 'OUT_OF_STOCK'
      ) {
        const dailyVelocity = product.quantitySold || 0;
        const daysRemaining = dailyVelocity > 0
          ? Math.round(product.currentStock / dailyVelocity)
          : product.currentStock > 0 ? 7 : 0;

        if (daysRemaining <= 5) {
          const severity = daysRemaining <= 2 ? 'critical' : 'warning';
          const existing = await AIAlert.findOne({
            category: 'low_stock',
            'metadata.sku': product.sku,
            acknowledged: false,
          });

          if (!existing) {
            const alert = await AIAlert.create({
              alertId: nextAlertId(),
              category: 'low_stock',
              title: daysRemaining <= 2 ? 'Critical Stock Exhaustion Projected' : 'Stock Depletion Warning',
              description: `${product.name} is selling faster than average. Projected to run out in ${daysRemaining} day(s).`,
              impact: `Potential revenue loss if not restocked`,
              severity,
              source: 'AI Inventory Forecaster',
              date: 'Today',
              timeGroup: 'Today',
              metadata: {
                product: product.name,
                sku: product.sku,
                currentStock: product.currentStock,
                daysRemaining,
                velocity: `${dailyVelocity} units/day`,
                recommendedReorder: Math.max(50, Math.round(dailyVelocity * 14)),
              },
            });
            generated.push(alert);
          }
        }
      }
    }
  }

  // 2. Scan for sales target gaps (branch performance)
  const branchSnapshots = await BusinessAnalyticsSnapshot.aggregate([
    { $match: { snapshotDate: { $gte: new Date(Date.now() - 30 * DAY_MS) } } },
    {
      $group: {
        _id: '$branchName',
        totalRevenue: { $sum: '$sales.netRevenue' },
        daysWithData: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$snapshotDate' } } },
      },
    },
  ]);

  for (const branch of branchSnapshots) {
    const daysElapsed = branch.daysWithData.length || 1;
    const dailyRate = branch.totalRevenue / daysElapsed;
    const projectedMonthly = dailyRate * 30;
    const monthlyTarget = 13500000; // Standard branch target

    if (projectedMonthly < monthlyTarget * 0.8) {
      const shortfall = Math.round(monthlyTarget - projectedMonthly);
      const existing = await AIAlert.findOne({
        category: 'sales_target',
        'metadata.branch': branch._id,
        acknowledged: false,
      });

      if (!existing) {
        const alert = await AIAlert.create({
          alertId: nextAlertId(),
          category: 'sales_target',
          title: 'Monthly Branch Sales Target Off-Track',
          description: `${branch._id} sales velocity is currently below the required run-rate to meet its monthly goal.`,
          impact: `Projected monthly shortfall: Rs. ${shortfall.toLocaleString()}`,
          severity: 'warning',
          source: 'Target Analyzer',
          date: 'Today',
          timeGroup: 'Today',
          metadata: {
            branch: branch._id,
            currentSales: Math.round(branch.totalRevenue),
            targetSales: monthlyTarget,
            completionPct: Math.round((branch.totalRevenue / monthlyTarget) * 100),
            daysRemaining: 30 - daysElapsed,
            requiredRunRate: `Rs. ${Math.round(monthlyTarget / 30).toLocaleString()}/day`,
            actualRunRate: `Rs. ${Math.round(dailyRate).toLocaleString()}/day`,
          },
        });
        generated.push(alert);
      }
    }
  }

  return { generatedCount: generated.length, alerts: generated };
};

// ─── Module details ───
const getModuleDetails = async () => ({
  module: 'AI Anomalies & Alerts',
  status: 'Active',
  endpoints: [
    'GET /api/v1/ai-alerts',
    'GET /api/v1/ai-alerts/:id',
    'PATCH /api/v1/ai-alerts/:id/acknowledge',
    'DELETE /api/v1/ai-alerts/:id',
    'POST /api/v1/ai-alerts/generate',
  ],
});

module.exports = {
  getModuleDetails,
  getAlerts,
  getAlertById,
  acknowledgeAlert,
  deleteAlert,
  generateAlerts,
};
