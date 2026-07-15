const env = require('../config/env');
const notifications = require('../modules/notifications/service');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  
  console.error(`[Error] ${req.method} ${req.url} - ${err.stack}`);

  // Persist unexpected server failures as real operational system messages.
  // Client/validation errors are intentionally excluded because they are not
  // platform health incidents.
  if (statusCode >= 500 && !req.originalUrl.includes('/notifications')) {
    notifications.createNotification({
      title: 'Server operation failed',
      message: `${req.method} ${req.originalUrl.split('?')[0]} returned an unexpected error.`,
      category: 'system',
      priority: 'high',
      source: 'RetailSync API',
      metadata: {
        systemStatus: 'error',
        statusCode,
        method: req.method,
        path: req.originalUrl.split('?')[0],
      },
    }).catch((notificationError) => {
      console.error('Failed to record system message:', notificationError.message);
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
