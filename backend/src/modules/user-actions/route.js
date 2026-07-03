const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { validateCreateUserAction } = require('./validation');

// 1. POST /api/v1/user-actions - Create a new audit log
router.post('/', validateCreateUserAction, controller.createLog);

// 2. GET /api/v1/user-actions - Retrieve audit logs
router.get('/', controller.getLogs);

// 4. GET /api/v1/user-actions/stats - Return summary statistics
router.get('/stats', controller.getStats);

// 3. GET /api/v1/user-actions/:id - Retrieve a single audit log
router.get('/:id', controller.getLogById);

module.exports = router;
