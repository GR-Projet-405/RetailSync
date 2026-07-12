const mongoose = require('mongoose');
const BusinessAnalyticsSnapshot = require('../modules/business-analytics/model');
const AIAlert = require('../modules/ai-alerts/model');
const Branch = require('../modules/branch-management/branch.model');

const DAY_MS = 24 * 60 * 60 * 1000;

// ─── Product catalog (matches frontend expectations) ───
const PRODUCTS = [
  { sku: 'COF-ESP-001', name: 'Espresso Blend Coffee', category: 'Beverages', basePrice: 1500, costPrice: 750, baseVelocity: 38, reorderLevel: 50 },
  { sku: 'BAK-WWB-002', name: 'Whole Wheat Bread', category: 'Bakery Items', basePrice: 1050, costPrice: 420, baseVelocity: 28, reorderLevel: 40 },
  { sku: 'FRU-BAN-003', name: 'Organic Bananas (kg)', category: 'Fresh Produce', basePrice: 900, costPrice: 360, baseVelocity: 35, reorderLevel: 60 },
  { sku: 'DY-GRY-004', name: 'Greek Yogurt (500g)', category: 'Dairy & Eggs', basePrice: 1200, costPrice: 540, baseVelocity: 22, reorderLevel: 35 },
  { sku: 'BAK-CCC-005', name: 'Chocolate Chip Cookie', category: 'Snacks & Sweets', basePrice: 600, costPrice: 240, baseVelocity: 18, reorderLevel: 30 },
  { sku: 'BEV-OJC-006', name: 'Fresh Orange Juice (1L)', category: 'Beverages', basePrice: 1350, costPrice: 600, baseVelocity: 20, reorderLevel: 30 },
  { sku: 'DAI-MWL-007', name: 'Full Cream Milk (1L)', category: 'Dairy & Eggs', basePrice: 750, costPrice: 330, baseVelocity: 45, reorderLevel: 60 },
  { sku: 'SNK-GBR-008', name: 'Granola Bars (Pack of 6)', category: 'Snacks & Sweets', basePrice: 1650, costPrice: 840, baseVelocity: 15, reorderLevel: 25 },
  { sku: 'FRP-AVD-009', name: 'Hass Avocados (each)', category: 'Fresh Produce', basePrice: 600, costPrice: 270, baseVelocity: 25, reorderLevel: 35 },
  { sku: 'BEV-GTE-010', name: 'Green Tea (Box of 25)', category: 'Beverages', basePrice: 1800, costPrice: 900, baseVelocity: 12, reorderLevel: 20 },
];

// Branches to seed for (first 3 active branches)
const BRANCH_DATA = [
  { code: 'BR001', name: 'Colombo Central', revenueMultiplier: 1.3 },
  { code: 'BR002', name: 'Kandy Branch', revenueMultiplier: 0.9 },
  { code: 'BR003', name: 'Galle Branch', revenueMultiplier: 0.8 },
];

// ─── Helpers ───
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const jitter = (base, pct) => base * (1 + (Math.random() * 2 - 1) * pct);

const dayOfWeekMultiplier = (date) => {
  const dow = new Date(date).getDay();
  // 0=Sun,1=Mon,...,5=Fri,6=Sat
  const multipliers = [1.1, 0.85, 0.9, 0.95, 1.0, 1.25, 1.4];
  return multipliers[dow];
};

const monthTrendMultiplier = (dayIdx, totalDays) => {
  // Gradual upward trend over 90 days
  return 1.0 + (dayIdx / totalDays) * 0.18;
};

// ─── Generate one day's snapshot for a branch ───
const generateDailySnapshot = (date, branch, branchId, dayIdx, totalDays, productsList) => {
  const dowMult = dayOfWeekMultiplier(date);
  const trendMult = monthTrendMultiplier(dayIdx, totalDays);
  const branchMult = branch.revenueMultiplier;

  // ─── Product-level data ───
  const products = productsList.map((prod) => {
    const velocity = Math.round(jitter(prod.baseVelocity * dowMult * trendMult * branchMult, 0.2));
    const quantitySold = Math.max(1, velocity);
    const revenue = Math.round(quantitySold * prod.basePrice * 100) / 100;
    const grossProfit = Math.round(quantitySold * (prod.basePrice - prod.costPrice) * 100) / 100;

    // Stock simulation: decreases over time, occasionally restocked
    const baseStock = rand(60, 200);
    const consumed = Math.round(quantitySold * rand(1, 3));
    const restocked = dayIdx % rand(5, 10) === 0 ? rand(80, 150) : 0;
    const currentStock = Math.max(0, baseStock - consumed + restocked);
    const daysOfSupply = quantitySold > 0 ? Math.round(currentStock / quantitySold) : 99;

    let inventoryStatus = 'HEALTHY';
    if (currentStock === 0) inventoryStatus = 'OUT_OF_STOCK';
    else if (currentStock < prod.reorderLevel * 0.5) inventoryStatus = 'LOW_STOCK';
    else if (currentStock > prod.reorderLevel * 4) inventoryStatus = 'OVERSTOCK';

    return {
      productId: prod.productId,
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      quantitySold,
      revenue,
      grossProfit,
      currentStock,
      reorderLevel: prod.reorderLevel,
      daysOfSupply,
      inventoryStatus,
    };
  });

  // ─── Aggregated sales metrics ───
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
  const totalCogs = products.reduce((s, p) => s + (p.revenue - p.grossProfit), 0);
  const totalItemsSold = products.reduce((s, p) => s + p.quantitySold, 0);
  const orderCount = Math.round(totalItemsSold / rand(2, 4)); // avg items per order
  const discountPct = rand(3, 8) / 100;
  const taxRate = 0.05; // 5%
  const refundRate = rand(1, 3) / 100;

  const grossRevenue = Math.round(totalRevenue * 100) / 100;
  const discounts = Math.round(grossRevenue * discountPct * 100) / 100;
  const tax = Math.round((grossRevenue - discounts) * taxRate * 100) / 100;
  const refunds = Math.round(grossRevenue * refundRate * 100) / 100;
  const netRevenue = Math.round((grossRevenue - discounts + tax - refunds) * 100) / 100;

  // ─── Inventory counts ───
  const lowStockCount = products.filter((p) => p.inventoryStatus === 'LOW_STOCK').length;
  const outOfStockCount = products.filter((p) => p.inventoryStatus === 'OUT_OF_STOCK').length;
  const overstockCount = products.filter((p) => p.inventoryStatus === 'OVERSTOCK').length;
  const stockValue = products.reduce((s, p) => s + p.currentStock * (p.revenue / (p.quantitySold || 1)), 0);

  // ─── Customer metrics ───
  const newCustomers = Math.round(jitter(8 * branchMult, 0.3));
  const returningCustomers = Math.round(jitter(orderCount * 0.6, 0.2));
  const loyaltyPointsIssued = Math.round(netRevenue * 0.1);

  return {
    snapshotDate: new Date(date),
    branchId: branchId || null,
    branchName: branch.name,
    branchCode: branch.code,
    channel: 'POS',
    sales: {
      orderCount,
      itemCount: totalItemsSold,
      grossRevenue,
      discounts,
      tax,
      refunds,
      netRevenue,
      cogs: Math.round(totalCogs * 100) / 100,
    },
    inventory: {
      totalSkuCount: products.length,
      lowStockCount,
      outOfStockCount,
      overstockCount,
      deadStockCount: 0,
      stockValue: Math.round(stockValue * 100) / 100,
    },
    customers: {
      newCustomers,
      returningCustomers,
      loyaltyPointsIssued,
    },
    products,
    notes: '',
  };
};

// ─── Generate seed alerts ───
const generateSeedAlerts = () => [
  {
    alertId: 'AL-101',
    category: 'low_stock',
    title: 'Critical Stock Exhaustion Projected',
    description: 'Whole Wheat Bread is selling 45% faster than average weekly velocity. Projected to run out in 2 days.',
    impact: 'Potential Rs. 126,000 weekly revenue loss',
    severity: 'critical',
    source: 'AI Inventory Forecaster',
    date: 'Today, 10:15 AM',
    timeGroup: 'Today',
    metadata: {
      product: 'Whole Wheat Bread',
      sku: 'BAK-WWB-002',
      currentStock: 12,
      daysRemaining: 2,
      velocity: '24 units/day (Avg: 16 units/day)',
      recommendedReorder: 50,
    },
    acknowledged: false,
  },
  {
    alertId: 'AL-102',
    category: 'low_stock',
    title: 'Stock Depletion Warning',
    description: 'Chocolate Chip Cookies are trending. Projected to run out in 3 days.',
    impact: 'Medium revenue impact',
    severity: 'warning',
    source: 'AI Inventory Forecaster',
    date: 'Today, 09:30 AM',
    timeGroup: 'Today',
    metadata: {
      product: 'Chocolate Chip Cookie',
      sku: 'BAK-CCC-005',
      currentStock: 8,
      daysRemaining: 3,
      velocity: '12 units/day (Avg: 8 units/day)',
      recommendedReorder: 100,
    },
    acknowledged: false,
  },
  {
    alertId: 'AL-201',
    category: 'sales_target',
    title: 'Monthly Branch Sales Target Off-Track',
    description: 'Kandy Branch sales velocity is currently 22% below the required run-rate to meet its monthly goal.',
    impact: 'Projected monthly shortfall: Rs. 2,640,000',
    severity: 'warning',
    source: 'Target Analyzer',
    date: 'Yesterday, 06:00 PM',
    timeGroup: 'Yesterday',
    metadata: {
      branch: 'Kandy Branch',
      currentSales: 4860000,
      targetSales: 13500000,
      completionPct: 36,
      daysRemaining: 15,
      requiredRunRate: 'Rs. 576,000/day',
      actualRunRate: 'Rs. 324,000/day',
    },
    acknowledged: false,
  },
  {
    alertId: 'AL-301',
    category: 'anomaly',
    title: 'Anomalous Transaction Discount Detected',
    description: 'Cashier applied an atypical 75% custom discount on transaction TXN-10492.',
    impact: 'Exceeds standard maximum authorization rules by 55%',
    severity: 'critical',
    source: 'AI Anomaly & Fraud Guard',
    date: 'Today, 11:42 AM',
    timeGroup: 'Today',
    metadata: {
      transactionId: 'TXN-10492',
      cashier: 'Employee (ID: EMP-8822)',
      discount: '75% (Std Limit: 20%)',
      standardMax: '20%',
      itemsOrdered: '3x Premium Espresso Maker',
      terminal: 'POS-Terminal-04',
    },
    acknowledged: false,
  },
  {
    alertId: 'AL-302',
    category: 'anomaly',
    title: 'Out-of-Hours Activity Anomaly',
    description: 'A cash drawer opening and refund operation was registered at 03:15 AM (Standard hours are 08:00 AM - 10:00 PM).',
    impact: 'Potential unauthorized store entry / security breach',
    severity: 'critical',
    source: 'AI Anomaly & Fraud Guard',
    date: 'Today, 03:15 AM',
    timeGroup: 'Today',
    metadata: {
      operation: 'No-Sale Drawer Open & Refund',
      timestamp: '03:15:22 AM',
      terminalID: 'POS-Terminal-02',
      securityCheck: 'Flagged: Motion Sensor Activated',
    },
    acknowledged: false,
  },
  {
    alertId: 'AL-303',
    category: 'anomaly',
    title: 'Unusual Refund Pattern Detected',
    description: 'Terminal POS-03 processed 12 refunds in the last 2 hours, which is 6x the daily average.',
    impact: 'Potential fraudulent refund activity — Rs. 267,000 in refunds',
    severity: 'critical',
    source: 'AI Anomaly & Fraud Guard',
    date: 'Today, 02:30 PM',
    timeGroup: 'Today',
    metadata: {
      refundCount: 12,
      normalAverage: '2 refunds/day',
      totalRefundValue: 'Rs. 267,000',
      terminalID: 'POS-Terminal-03',
      timeWindow: 'Last 2 hours',
    },
    acknowledged: false,
  },
  {
    alertId: 'AL-203',
    category: 'sales_target',
    title: 'Weekly Revenue Target Exceeded',
    description: 'Colombo Central has exceeded its weekly revenue target by 15%. Great performance!',
    impact: 'Positive: Rs. 630,000 above target',
    severity: 'info',
    source: 'Target Analyzer',
    date: 'Yesterday, 11:00 PM',
    timeGroup: 'Yesterday',
    metadata: {
      branch: 'Colombo Central',
      weeklyTarget: 4200000,
      actualRevenue: 4830000,
      overPerformance: '+15%',
    },
    acknowledged: true,
    acknowledgedAt: new Date(),
  },
];

// ─── Main seeder function ───
const seedAIModules = async () => {
  try {
    console.log('Seeding AI modules data...');
    const Product = require('../modules/product-management/model');
    const realProducts = await Product.find({}).lean();
    let productsList = [];
    
    if (realProducts.length > 0) {
      productsList = realProducts.map(p => ({
        productId: p._id,
        sku: p.sku || `SKU-${p._id}`,
        name: p.name,
        category: p.category || 'General',
        basePrice: p.pricing?.sellingPrice || p.sellingPrice || 1500,
        costPrice: p.pricing?.costPrice || p.costPrice || 750,
        baseVelocity: Math.floor(Math.random() * 30) + 10,
        reorderLevel: 30
      }));
    } else {
      productsList = PRODUCTS.map(p => ({ ...p, productId: new mongoose.Types.ObjectId() }));
    }

    // ─── 1. Seed BusinessAnalyticsSnapshots ───
    console.log('  → Clearing old analytics snapshots...');
    await BusinessAnalyticsSnapshot.deleteMany({});

    // Look up real branch IDs if they exist
    const branchMap = {};
    for (const bd of BRANCH_DATA) {
      const branch = await Branch.findOne({ branchCode: bd.code });
      branchMap[bd.code] = branch ? branch._id : null;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const totalDays = 90;
    const startDate = new Date(today.getTime() - (totalDays - 1) * DAY_MS);

    const snapshots = [];
    for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
      const date = new Date(startDate.getTime() + dayIdx * DAY_MS);
      for (const branch of BRANCH_DATA) {
        snapshots.push(
          generateDailySnapshot(date, branch, branchMap[branch.code], dayIdx, totalDays, productsList)
        );
      }
    }

    // Insert in batches of 50 for efficiency
    const batchSize = 50;
    for (let i = 0; i < snapshots.length; i += batchSize) {
      await BusinessAnalyticsSnapshot.insertMany(snapshots.slice(i, i + batchSize));
    }
    console.log(`  → Seeded ${snapshots.length} analytics snapshots (${totalDays} days × ${BRANCH_DATA.length} branches).`);

    // ─── 2. Seed AI Alerts ───
    console.log('  → Clearing old AI alerts...');
    await AIAlert.deleteMany({});

    const alerts = generateSeedAlerts();
    await AIAlert.insertMany(alerts);
    console.log(`  → Seeded ${alerts.length} AI alerts.`);

    console.log('AI modules data seeded successfully!');
  } catch (error) {
    console.error('Error seeding AI modules:', error);
    throw error;
  }
};

module.exports = seedAIModules;
