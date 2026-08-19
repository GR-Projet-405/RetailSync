const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  // ── Mongoose Validation Error → always 400 Bad Request ──────────────────────
  if (err.name === 'ValidationError') {
    const fields = Object.keys(err.errors);
    const message = fields
      .map((f) => err.errors[f].message)
      .join('; ');
    console.error(`[ValidationError] ${req.method} ${req.url} - ${message}`);
    return res.status(400).json({
      success: false,
      message,
      errors: err.errors,
    });
  }

  // ── Mongoose Cast Error (invalid ObjectId) → 400 ────────────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field '${err.path}': ${err.value}`,
    });
  }

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  console.error(`[Error] ${req.method} ${req.url} - ${err.stack}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;