const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  console.error(`[Error] ${req.method} ${req.url} - ${err.stack}`);

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
