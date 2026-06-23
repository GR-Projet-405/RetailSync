const express = require('express');
const roleController = require('./role.controller');
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');

const router = express.Router();

// All role routes require authentication and roles.manage permission
router.use(verifyToken);

router.route('/')
  .get(hasPermission('roles.view'), roleController.getRoles)
  .post(hasPermission('roles.manage'), roleController.createRole);

router.route('/:id')
  .get(hasPermission('roles.view'), roleController.getRoleById)
  .put(hasPermission('roles.manage'), roleController.updateRole)
  .delete(hasPermission('roles.manage'), roleController.deleteRole);

module.exports = router;
