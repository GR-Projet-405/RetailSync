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

  const response = {
    success: false,
    message:
      statusCode >= 500 && env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error',
  };

  if (err.code) response.code = err.code;
  if (err.details) response.errors = err.details;

  // Stack traces are logged server-side above. Never send file paths or
  // implementation details to API clients, including in development mode.
  res.status(statusCode).json(response);
};

module.exports = errorHandler;
