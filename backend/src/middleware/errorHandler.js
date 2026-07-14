const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  console.error(`[Error] ${req.method} ${req.url} - ${err.stack}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
