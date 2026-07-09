const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');
const {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  resetPasswordSchema,
  updateRoleSchema,
  validate,
} = require('./user.validation');
const upload = require('../../middleware/upload.middleware');

//All user routes require authentication and users.manage permission
router.use(verifyToken);

// ─── Collection Routes ─────────────────────────────────────
router.get('/', hasPermission('users.view'), controller.getUsers);
router.get('/stats', hasPermission('users.view'), controller.getUserStats);
router.post('/', hasPermission('users.create'), upload.single('profileImage'), validate(createUserSchema), controller.createUser);

// ─── Single Resource Routes ────────────────────────────────
router.get('/:id', hasPermission('users.view'), controller.getUserById);
router.put('/:id', hasPermission('users.edit'), upload.single('profileImage'), validate(updateUserSchema), controller.updateUser);
router.delete('/:id', hasPermission('users.delete'), controller.deleteUser);

// ─── Action Routes ─────────────────────────────────────────
router.patch('/:id/status', hasPermission('users.edit'), validate(updateStatusSchema), controller.updateUserStatus);
router.patch('/:id/reset-password', hasPermission('users.edit'), validate(resetPasswordSchema), controller.resetPassword);
router.patch('/:id/role', hasPermission('users.edit'), validate(updateRoleSchema), controller.updateUserRole);

module.exports = router;



