const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

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
    env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  console.log("7. Token generated, sending response...");
  res.json({ 
    success: true, 
    token, 
    user: { 
      email: user.email, 
      roleId: { name: user.role } 
    } 
  });
});

// GET CURRENT USER ROUTE
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = USERS.find(u => u.email === decoded.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        email: user.email,
        roleId: { name: user.role }
      }
    });
  } catch (error) {
    console.error('Auth me error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// REGISTER ROUTE
router.post('/register', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Check if user already exists
  const existingUser = USERS.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Add new user
  const newUser = {
    email,
    password,
    role: role || 'EMPLOYEE'
  };
  USERS.push(newUser);

  const token = jwt.sign(
    { email: newUser.email, role: newUser.role },
    env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.status(201).json({
    success: true,
    token,
    user: {
      email: newUser.email,
      roleId: { name: newUser.role }
    }
  });
});

module.exports = router;