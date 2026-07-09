const express = require('express');
const authController = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.getMe);

router.get('/roles', verifyToken, authController.getAvailableRoles);
router.post('/select-role', verifyToken, authController.selectRole);

module.exports = router;
