const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { generateToken, authenticateToken, getCurrentUser } = require('../middleware/auth');

const router = express.Router();

// Input validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(409).json({ error: 'User with this email or username already exists' });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Insert new user
      const sql = `
        INSERT INTO users (username, email, password_hash, first_name, last_name, phone, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [username, email, passwordHash, firstName, lastName, phone, false], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }

        const userId = this.lastID;

        // Generate JWT token
        const token = generateToken(userId);

        res.status(201).json({
          message: 'User registered successfully',
          user: {
            id: userId,
            username,
            email,
            firstName,
            lastName,
            phone
          },
          token,
          requiresEmailVerification: true
        });
      });
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { identifier, password } = req.body;

    // Find user by email or username
    const sql = 'SELECT * FROM users WHERE (email = ? OR username = ?) AND status = "active"';
    db.get(sql, [identifier, identifier], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

      // Generate JWT token
      const token = generateToken(user.id);

      // Check if 2FA is required
      if (user.two_factor_enabled) {
        return res.json({
          message: '2FA required',
          requiresTwoFactor: true,
          twoFactorMethod: user.two_factor_method,
          token: token // Temporary token for 2FA verification
        });
      }

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          avatarUrl: user.avatar_url,
          isAdmin: user.is_admin,
          isVerified: user.is_verified,
          balance: user.balance
        },
        token
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify 2FA code
router.post('/verify-2fa', authenticateToken, (req, res) => {
  const { code } = req.body;

  if (!code || code.length !== 6) {
    return res.status(400).json({ error: 'Valid 6-digit code required' });
  }

  // For demo purposes, accept any 6-digit code
  // In production, you'd verify against TOTP, SMS, or email

  db.get('SELECT * FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate final token
    const token = generateToken(user.id);

    res.json({
      message: '2FA verification successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        isAdmin: user.is_admin,
        isVerified: user.is_verified,
        balance: user.balance
      },
      token
    });
  });
});

// Get current user profile
router.get('/me', authenticateToken, getCurrentUser, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ user: req.user });
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Verify email
router.post('/verify-email', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Verification token required' });
  }

  // In production, you'd verify the token and update the user's email_verified status
  res.json({ message: 'Email verified successfully' });
});

// Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const { email } = req.body;

  // In production, you'd generate a reset token and send email
  res.json({ message: 'Password reset email sent' });
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Valid token and password required' });
  }

  const { token, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    // In production, you'd verify the reset token
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;