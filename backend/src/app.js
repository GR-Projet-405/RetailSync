const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Standard Security & Logging Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize MongoDB Connection
connectDB();

// Global health check router
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'RetailSync API Server' });
});

// Pre-load core models to avoid MissingSchemaError during population
require('./modules/branch-management/branch.model');
require('./modules/role-management/role.model');
require('./modules/user-management/user.model');

// Dynamically register routes for all 28 modular folders
const modulesPath = path.join(__dirname, 'modules');
if (fs.existsSync(modulesPath)) {
  fs.readdirSync(modulesPath).forEach((folderName) => {
    const routePath = path.join(modulesPath, folderName, 'route.js');
    if (fs.existsSync(routePath)) {
      const router = require(routePath);
      app.use(`/api/v1/${folderName}`, router);
    }
  });
}

// Global fallback JSON Error Handler
app.use(errorHandler);

module.exports = app;
