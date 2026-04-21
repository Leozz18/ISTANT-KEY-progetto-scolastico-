const jwt = require('jsonwebtoken');
const { db } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Verify JWT token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.userId = decoded.userId;
    next();
  });
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.userId = decoded.userId;
      }
    });
  }

  next();
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  db.get('SELECT is_admin FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  });
};

// Get current user middleware
const getCurrentUser = (req, res, next) => {
  if (!req.userId) {
    req.user = null;
    return next();
  }

  db.get(`
    SELECT id, username, email, first_name, last_name, phone, avatar_url,
           is_admin, is_verified, email_verified, phone_verified,
           two_factor_enabled, balance, created_at, last_login, status
    FROM users WHERE id = ? AND status = 'active'
  `, [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    req.user = user || null;
    next();
  });
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  requireAdmin,
  getCurrentUser
};