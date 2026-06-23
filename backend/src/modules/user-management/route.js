// Entry point for dynamic route loader (app.js reads route.js from each module folder)
// This module registers as: /api/v1/user-management
module.exports = require('./user.route');
