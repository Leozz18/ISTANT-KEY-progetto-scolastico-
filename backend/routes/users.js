const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { authenticateToken, getCurrentUser, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, getCurrentUser, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ user: req.user });
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().isLength({ min: 1, max: 50 }),
  body('lastName').optional().isLength({ min: 1, max: 50 }),
  body('phone').optional().isMobilePhone(),
  body('username').optional().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/),
  body('email').optional().isEmail().normalizeEmail()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { firstName, lastName, phone, username, email } = req.body;
  const userId = req.userId;

  // Check if username or email conflicts with other users
  let checkQuery = 'SELECT id FROM users WHERE (';
  let checkParams = [];
  let conditions = [];

  if (username) {
    conditions.push('username = ?');
    checkParams.push(username);
  }
  if (email) {
    conditions.push('email = ?');
    checkParams.push(email);
  }

  if (conditions.length > 0) {
    checkQuery += conditions.join(' OR ') + ') AND id != ?';
    checkParams.push(userId);

    db.get(checkQuery, checkParams, (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(409).json({ error: 'Username or email already taken' });
      }

      updateProfile();
    });
  } else {
    updateProfile();
  }

  function updateProfile() {
    const updateFields = [];
    const updateValues = [];

    if (firstName !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(lastName);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

    db.run(sql, updateValues, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      // Get updated user data
      db.get(`
        SELECT id, username, email, first_name, last_name, phone, avatar_url,
               is_admin, is_verified, email_verified, phone_verified,
               two_factor_enabled, balance, created_at, updated_at
        FROM users WHERE id = ?
      `, [userId], (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          message: 'Profile updated successfully',
          user: user
        });
      });
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  try {
    // Get current user
    db.get('SELECT password_hash FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPasswordHash, userId], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update password' });
          }

          res.json({ message: 'Password changed successfully' });
        });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup 2FA
router.post('/setup-2fa', authenticateToken, (req, res) => {
  const { method, phone, secret } = req.body;

  if (!['authenticator', 'sms', 'email'].includes(method)) {
    return res.status(400).json({ error: 'Invalid 2FA method' });
  }

  const updates = {
    two_factor_enabled: true,
    two_factor_method: method
  };

  if (method === 'authenticator' && secret) {
    updates.two_factor_secret = secret;
  }

  if (method === 'sms' && phone) {
    updates.phone = phone;
    updates.phone_verified = true;
  }

  const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const updateValues = Object.values(updates);
  updateValues.push(req.userId);

  db.run(`UPDATE users SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    updateValues, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to setup 2FA' });
      }

      res.json({
        message: '2FA setup successfully',
        method: method
      });
    });
});

// Disable 2FA
router.post('/disable-2fa', authenticateToken, (req, res) => {
  db.run(`
    UPDATE users SET
    two_factor_enabled = FALSE,
    two_factor_method = NULL,
    two_factor_secret = NULL,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [req.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to disable 2FA' });
    }

    res.json({ message: '2FA disabled successfully' });
  });
});

// Get user balance
router.get('/balance', authenticateToken, (req, res) => {
  db.get('SELECT balance FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ balance: user ? user.balance : 0 });
  });
});

// Admin: Get all users
router.get('/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  db.all(`
    SELECT id, username, email, first_name, last_name, phone, avatar_url,
           is_admin, is_verified, email_verified, phone_verified,
           two_factor_enabled, balance, created_at, last_login, status
    FROM users
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [limit, offset], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count
    db.get('SELECT COUNT(*) as total FROM users', [], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        users: users,
        pagination: {
          page: page,
          limit: limit,
          total: result.total,
          pages: Math.ceil(result.total / limit)
        }
      });
    });
  });
});

// Admin: Update user status
router.put('/admin/users/:userId/status', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!['active', 'suspended', 'banned'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update user status' });
      }

      res.json({ message: 'User status updated successfully' });
    });
});

module.exports = router;