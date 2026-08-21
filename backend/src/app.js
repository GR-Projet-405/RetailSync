require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const recordActivity = require('./middleware/activity.middleware');

const app = express();

// Standard Security & Logging Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(recordActivity);

// Initialize MongoDB Connection
connectDB();

// Global health check router
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "RetailSync API Server" });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/sales', require('../routes/salesRoutes'));

// Pre-load core models to avoid MissingSchemaError during population
require('./modules/branch-management/branch.model');
require('./modules/role-management/role.model');
require('./modules/user-management/user.model');
require('./modules/goods-receiving/model');
require('./modules/promotions-discounts/promotion.model');
require('./modules/promotions-discounts/coupon.model');
require('./modules/promotions-discounts/discountRule.model');
require('./modules/category-management/model');
require('./modules/supplier-management/model');
require('./modules/warehouse-management/model');
require('./modules/product-management/model');
require('./modules/inventory-management/model');

// Static route registration for Vercel deployment (replaces dynamic readdirSync)
app.use("/api/v1/customers", require("./modules/customer-management/route"));
app.use("/api/v1/ai-alerts", require("./modules/ai-alerts/route"));
app.use("/api/v1/ai-assistant-disabled", require("./modules/ai-assistant-disabled/route"));
app.use("/api/v1/ai-forecasting", require("./modules/ai-forecasting/route"));
app.use("/api/v1/ai-reordering", require("./modules/ai-reordering/route"));
app.use("/api/v1/audit-logs", require("./modules/audit-logs/route"));
app.use("/api/v1/auth", require("./modules/auth/route"));
app.use("/api/v1/branch-management", require("./modules/branch-management/route"));
app.use("/api/v1/business-analytics", require("./modules/business-analytics/route"));
app.use("/api/v1/category-management", require("./modules/category-management/route"));
app.use("/api/v1/contact-support", require("./modules/contact-support/route"));
app.use("/api/v1/dashboard", require("./modules/dashboard/route"));
app.use("/api/v1/employee-management", require("./modules/employee-management/route"));
app.use("/api/v1/goods-receiving", require("./modules/goods-receiving/route"));
app.use("/api/v1/help-support", require("./modules/help-support/route"));
app.use("/api/v1/inventory-management", require("./modules/inventory-management/route"));
app.use("/api/v1/notifications", require("./modules/notifications/route"));
app.use("/api/v1/payment-processing", require("./modules/payment-processing/route"));
app.use("/api/v1/pos-billing", require("./modules/pos-billing/route"));
app.use("/api/v1/product-management", require("./modules/product-management/route"));
app.use("/api/v1/profile-settings", require("./modules/profile-settings/route"));
app.use("/api/v1/promotions-discounts", require("./modules/promotions-discounts/route"));
app.use("/api/v1/purchase-orders", require("./modules/purchase-orders/route"));
app.use("/api/v1/reports", require("./modules/reports/route"));
app.use("/api/v1/returns-refunds", require("./modules/returns-refunds/route"));
app.use("/api/v1/sales-history", require("./modules/sales-history/route"));
app.use("/api/v1/stock-transfers", require("./modules/stock-transfers/route"));
app.use("/api/v1/supplier-management", require("./modules/supplier-management/route"));
app.use("/api/v1/system-events", require("./modules/system-events/route"));
app.use("/api/v1/user-actions", require("./modules/user-actions/route"));
app.use("/api/v1/user-management", require("./modules/user-management/route"));
app.use("/api/v1/user-role-management", require("./modules/user-role-management/route"));
app.use("/api/v1/role-management", require("./modules/role-management/route"));
app.use("/api/v1/warehouse-management", require("./modules/warehouse-management/route"));

// Global fallback JSON Error Handler
app.use(errorHandler);

module.exports = app;
// Trigger hot-reload for database connection state refreshing