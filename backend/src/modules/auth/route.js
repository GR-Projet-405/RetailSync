const express = require('express');
const authController = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.login);

  console.log("6. SUCCESS: User found!");
  const token = jwt.sign(
    { email: user.email, role: user.role },
    'your_secret_key_123',
    { expiresIn: '1d' }
  );

  console.log("7. Token generated, sending response...");
  res.json({
    success: true,
    token,
    user: { email: user.email, role: user.role }
  });
});
router.get('/available-roles', authController.getAvailableRoles);
router.post('/select-role', authController.selectRole);

// Protected routes
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;