const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard stats
router.get('/dashboard/stats', authenticateToken, requireAdmin, (req, res) => {
  const stats = {};

  // Get user count
  db.get('SELECT COUNT(*) as total FROM users WHERE status = "active"', [], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.totalUsers = result.total;

    // Get order stats
    db.get(`
      SELECT COUNT(*) as totalOrders, SUM(total_amount) as totalRevenue
      FROM orders WHERE status != 'cancelled'
    `, [], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.totalOrders = result.totalOrders || 0;
      stats.totalRevenue = result.totalRevenue || 0;

      // Get product count
      db.get('SELECT COUNT(*) as total FROM products WHERE is_active = 1', [], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.totalProducts = result.total;

        // Get recent orders
        db.all(`
          SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
                 u.username, COUNT(oi.id) as item_count
          FROM orders o
          JOIN users u ON o.user_id = u.id
          LEFT JOIN order_items oi ON o.id = oi.order_id
          GROUP BY o.id
          ORDER BY o.created_at DESC
          LIMIT 5
        `, [], (err, recentOrders) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          stats.recentOrders = recentOrders;

          res.json({ stats });
        });
      });
    });
  });
});

// Get all orders (admin)
router.get('/orders', authenticateToken, requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;
  const offset = (page - 1) * limit;

  let whereClause = '';
  let whereParams = [];

  if (status) {
    whereClause = 'WHERE o.status = ?';
    whereParams.push(status);
  }

  db.all(`
    SELECT o.id, o.order_number, o.total_amount, o.status, o.payment_method,
           o.created_at, o.updated_at, u.username, u.email,
           COUNT(oi.id) as item_count
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ${whereClause}
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `, [...whereParams, limit, offset], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count
    db.get(`SELECT COUNT(*) as total FROM orders o ${whereClause}`, whereParams, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        orders: orders,
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

// Update order status (admin)
router.put('/orders/:orderId/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { orderId } = req.params;
  const { status } = req.body;

  db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, orderId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update order status' });
      }

      res.json({ message: 'Order status updated successfully' });
    });
});

// Get all products (admin)
router.get('/products', authenticateToken, requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  db.all(`
    SELECT id, title, price, original_price, platform, genre, developer,
           publisher, is_active, is_featured, stock_quantity, created_at
    FROM products
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [limit, offset], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count
    db.get('SELECT COUNT(*) as total FROM products', [], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        products: products,
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

// Create new product (admin)
router.post('/products', authenticateToken, requireAdmin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('platform').notEmpty().withMessage('Platform is required'),
  body('description').optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const {
    title, description, price, originalPrice, platform, genre,
    developer, publisher, releaseDate, imageUrl, rating, stockQuantity
  } = req.body;

  const sql = `
    INSERT INTO products (title, description, price, original_price, platform, genre,
                         developer, publisher, release_date, image_url, rating, stock_quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    title, description, price, originalPrice, platform, genre,
    developer, publisher, releaseDate, imageUrl, rating, stockQuantity
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create product' });
    }

    res.status(201).json({
      message: 'Product created successfully',
      productId: this.lastID
    });
  });
});

// Update product (admin)
router.put('/products/:productId', authenticateToken, requireAdmin, (req, res) => {
  const { productId } = req.params;
  const updates = req.body;

  const updateFields = [];
  const updateValues = [];

  // Build dynamic update query
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      updateFields.push(`${key} = ?`);
      updateValues.push(updates[key]);
    }
  });

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(productId);

  const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;

  db.run(sql, updateValues, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update product' });
    }

    res.json({ message: 'Product updated successfully' });
  });
});

// Delete product (admin)
router.delete('/products/:productId', authenticateToken, requireAdmin, (req, res) => {
  const { productId } = req.params;

  // Soft delete by setting is_active to false
  db.run('UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [productId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete product' });
      }

      res.json({ message: 'Product deleted successfully' });
    });
});

// Get support tickets (admin)
router.get('/support/tickets', authenticateToken, requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;
  const offset = (page - 1) * limit;

  let whereClause = '';
  let whereParams = [];

  if (status) {
    whereClause = 'WHERE st.status = ?';
    whereParams.push(status);
  }

  db.all(`
    SELECT st.id, st.subject, st.category, st.priority, st.status,
           st.created_at, st.updated_at, u.username, u.email
    FROM support_tickets st
    JOIN users u ON st.user_id = u.id
    ${whereClause}
    ORDER BY st.created_at DESC
    LIMIT ? OFFSET ?
  `, [...whereParams, limit, offset], (err, tickets) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count
    db.get(`SELECT COUNT(*) as total FROM support_tickets st ${whereClause}`, whereParams, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        tickets: tickets,
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

// Get ticket details (admin)
router.get('/support/tickets/:ticketId', authenticateToken, requireAdmin, (req, res) => {
  const { ticketId } = req.params;

  // Get ticket info
  db.get(`
    SELECT st.*, u.username, u.email, u.first_name, u.last_name
    FROM support_tickets st
    JOIN users u ON st.user_id = u.id
    WHERE st.id = ?
  `, [ticketId], (err, ticket) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Get ticket messages
    db.all(`
      SELECT tm.*, u.username
      FROM ticket_messages tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.ticket_id = ?
      ORDER BY tm.created_at ASC
    `, [ticketId], (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        ticket: ticket,
        messages: messages
      });
    });
  });
});

// Update ticket status (admin)
router.put('/support/tickets/:ticketId/status', authenticateToken, requireAdmin, [
  body('status').isIn(['open', 'in_progress', 'waiting_user', 'resolved', 'closed'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { ticketId } = req.params;
  const { status } = req.body;

  const updateData = {
    status: status,
    updated_at: new Date().toISOString()
  };

  if (status === 'resolved' || status === 'closed') {
    updateData.resolved_at = new Date().toISOString();
  }

  const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
  const updateValues = Object.values(updateData);
  updateValues.push(ticketId);

  db.run(`UPDATE support_tickets SET ${updateFields} WHERE id = ?`, updateValues, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update ticket status' });
    }

    res.json({ message: 'Ticket status updated successfully' });
  });
});

// Reply to ticket (admin)
router.post('/support/tickets/:ticketId/reply', authenticateToken, requireAdmin, [
  body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { ticketId } = req.params;
  const { message } = req.body;
  const adminId = req.userId;

  // Insert message
  db.run(`
    INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin)
    VALUES (?, ?, ?, 1)
  `, [ticketId, adminId, message], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to send reply' });
    }

    // Update ticket updated_at
    db.run('UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [ticketId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update ticket' });
        }

        res.json({ message: 'Reply sent successfully' });
      });
  });
});

// Get revenue analytics
router.get('/analytics/revenue', authenticateToken, requireAdmin, (req, res) => {
  const period = req.query.period || '30d'; // 7d, 30d, 90d, 1y

  let dateFilter = '';
  switch (period) {
    case '7d':
      dateFilter = "DATE(created_at) >= DATE('now', '-7 days')";
      break;
    case '30d':
      dateFilter = "DATE(created_at) >= DATE('now', '-30 days')";
      break;
    case '90d':
      dateFilter = "DATE(created_at) >= DATE('now', '-90 days')";
      break;
    case '1y':
      dateFilter = "DATE(created_at) >= DATE('now', '-1 year')";
      break;
    default:
      dateFilter = "DATE(created_at) >= DATE('now', '-30 days')";
  }

  db.all(`
    SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
    FROM orders
    WHERE status != 'cancelled' AND ${dateFilter}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `, [], (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ analytics: data, period });
  });
});

module.exports = router;