const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  resetPasswordSchema,
  updateRoleSchema,
  validate,
} = require('./user.validation');

// ─── Collection Routes ─────────────────────────────────────
router.get('/', controller.getUsers);
router.get('/stats', controller.getUserStats);
router.post('/', validate(createUserSchema), controller.createUser);

// ─── Single Resource Routes ────────────────────────────────
router.get('/:id', controller.getUserById);
router.put('/:id', validate(updateUserSchema), controller.updateUser);
router.delete('/:id', controller.deleteUser);

// ─── Action Routes ─────────────────────────────────────────
router.patch('/:id/status', validate(updateStatusSchema), controller.updateUserStatus);
router.patch('/:id/reset-password', validate(resetPasswordSchema), controller.resetPassword);
router.patch('/:id/role', validate(updateRoleSchema), controller.updateUserRole);

module.exports = router;
