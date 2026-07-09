const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Hardcoded mock users
const USERS = [
  { email: 'admin@retailsync.com', password: 'Admin@123', role: 'ADMIN' },
  { email: 'manager@retailsync.com', password: 'Admin@123', role: 'BRANCH_MANAGER' },
  { email: 'employee@retailsync.com', password: 'Admin@123', role: 'EMPLOYEE' },
];

// LOGIN ROUTE
router.post('/login', (req, res) => {
  console.log("========== LOGIN ATTEMPT RECEIVED ==========");
  console.log("1. Headers:", req.headers);
  console.log("2. Body received:", req.body);

  const { email, password } = req.body;

  // Check if body is empty
  if (!email || !password) {
    console.log("3. ERROR: Email or Password missing!");
    return res.status(400).json({ message: 'Email and password are required' });
  }

  console.log("4. Looking for user:", email);
  const user = USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    console.log("5. FAILED: User not found or password mismatch");
    return res.status(401).json({ message: 'Invalid email or password' });
  }

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

module.exports = router;