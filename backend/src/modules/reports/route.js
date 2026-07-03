const express = require('express');
const router  = express.Router();

const controller                   = require('./controller');
const { validate, generateReportSchema } = require('./validation');
const { verifyToken, hasPermission }     = require('../../middleware/auth.middleware');

// All report endpoints require a valid session
router.use(verifyToken);

// Named routes — must all come before /:id so they aren't swallowed as id params
router.get('/summary',           hasPermission('reports.view'), controller.getSummaryStats);
router.get('/branch-performance',hasPermission('reports.view'), controller.getBranchPerformance);

// Recent reports list
router.get('/', hasPermission('reports.view'), controller.getRecentReports);

// Generate a new report
router.post(
  '/generate',
  hasPermission('reports.view'),
  validate(generateReportSchema),
  controller.generateReport
);

// Single report
router.get('/:id',    hasPermission('reports.view'), controller.getReportById);
router.delete('/:id', hasPermission('reports.view'), controller.deleteReport);

module.exports = router;
