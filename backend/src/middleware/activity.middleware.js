const notifications = require('../modules/notifications/service');

const MODULE_METADATA = {
  'purchase-orders': { label: 'Purchase order', activityType: 'orders', category: 'orders' },
  'pos-billing': { label: 'POS sale', activityType: 'orders', category: 'orders' },
  'payment-processing': { label: 'Payment', activityType: 'payments', category: 'orders' },
  'sales-history': { label: 'Sale', activityType: 'orders', category: 'orders' },
  'inventory-management': { label: 'Inventory', activityType: 'inventory', category: 'inventory' },
  'goods-receiving': { label: 'Goods receipt', activityType: 'inventory', category: 'inventory' },
  'stock-transfers': { label: 'Stock transfer', activityType: 'inventory', category: 'inventory' },
  'product-management': { label: 'Product', activityType: 'inventory', category: 'inventory' },
  'customer-management': { label: 'Customer', activityType: 'orders', category: 'orders' },
};

const ACTIONS = {
  POST: 'created',
  PUT: 'updated',
  PATCH: 'updated',
  DELETE: 'deleted',
};

const getModuleName = (originalUrl = '') => {
  const segments = originalUrl.split('?')[0].split('/').filter(Boolean);
  const apiVersionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
  return apiVersionIndex >= 0 ? segments[apiVersionIndex + 1] || 'system' : 'system';
};

/**
 * Records real, successful write operations as activity entries. It deliberately
 * observes the response rather than trusting request input, and never blocks a
 * completed business operation if activity recording is unavailable.
 */
const recordActivity = (req, res, next) => {
  if (
    !ACTIONS[req.method] ||
    req.originalUrl.includes('/notifications') ||
    req.originalUrl.includes('/auth')
  ) {
    return next();
  }

  res.on('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return;

    const moduleName = getModuleName(req.originalUrl);
    const module = MODULE_METADATA[moduleName] || {
      label: moduleName.replace(/-/g, ' '),
      activityType: 'system',
      category: 'activity',
    };
    const action = ACTIONS[req.method];
    const actor = [req.user?.firstName, req.user?.lastName]
      .filter(Boolean)
      .join(' ') || req.user?.email || 'A user';

    notifications.createNotification({
      title: `${module.label} ${action}`,
      message: `${actor} ${action} a ${module.label.toLowerCase()} record.`,
      category: module.category,
      priority: 'low',
      branchName: req.user?.branchName || null,
      source: module.label,
      metadata: {
        activityType: module.activityType,
        action,
        module: moduleName,
        method: req.method,
        path: req.originalUrl,
        actorId: req.user?._id || req.user?.id || null,
      },
    }).catch((error) => {
      console.error('Failed to record activity:', error.message);
    });
  });

  next();
};

module.exports = recordActivity;
