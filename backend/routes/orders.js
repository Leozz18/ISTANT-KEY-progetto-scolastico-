const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { authenticateToken, getCurrentUser } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/cart', authenticateToken, (req, res) => {
  const userId = req.userId;

  db.all(`
    SELECT ci.id, ci.quantity, ci.added_at,
           p.id as product_id, p.title, p.price, p.original_price, p.image_url, p.platform, p.discount_percentage
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ? AND p.is_active = 1
    ORDER BY ci.added_at DESC
  `, [userId], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Calculate totals
    let subtotal = 0;
    let discount = 0;

    cartItems.forEach(item => {
      const price = item.price;
      const originalPrice = item.original_price || price;
      subtotal += originalPrice * item.quantity;
      discount += (originalPrice - price) * item.quantity;
    });

    const total = subtotal - discount;

    res.json({
      items: cartItems,
      summary: {
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  });
});

// Add item to cart
router.post('/cart', authenticateToken, [
  body('productId').isInt().withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { productId, quantity } = req.body;
  const userId = req.userId;

  // Check if product exists and is active
  db.get('SELECT id, stock_quantity FROM products WHERE id = ? AND is_active = 1', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check stock
    if (product.stock_quantity !== -1 && product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already in cart
    db.get('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId], (err, existingItem) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, existingItem.id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update cart' });
          }
          res.json({ message: 'Cart updated successfully' });
        });
      } else {
        // Add new item
        db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to add to cart' });
          }
          res.json({ message: 'Item added to cart successfully' });
        });
      }
    });
  });
});

// Update cart item quantity
router.put('/cart/:itemId', authenticateToken, [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.userId;

  if (quantity === 0) {
    // Remove item
    db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to remove item' });
      }
      res.json({ message: 'Item removed from cart' });
    });
  } else {
    // Update quantity
    db.run('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, itemId, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update cart' });
      }
      res.json({ message: 'Cart updated successfully' });
    });
  }
});

// Remove item from cart
router.delete('/cart/:itemId', authenticateToken, (req, res) => {
  const { itemId } = req.params;
  const userId = req.userId;

  db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to remove item' });
    }
    res.json({ message: 'Item removed from cart' });
  });
});

// Clear cart
router.delete('/cart', authenticateToken, (req, res) => {
  const userId = req.userId;

  db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to clear cart' });
    }
    res.json({ message: 'Cart cleared successfully' });
  });
});

// Create order (checkout)
router.post('/checkout', authenticateToken, [
  body('paymentMethod').isIn(['card', 'paypal', 'crypto']).withMessage('Valid payment method required'),
  body('billingAddress').isObject().withMessage('Billing address required'),
  body('shippingAddress').optional().isObject()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { paymentMethod, billingAddress, shippingAddress, notes } = req.body;
  const userId = req.userId;

  try {
    // Get cart items
    const cartItems = await getCartItems(userId);
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    let total = 0;
    cartItems.forEach(item => {
      total += item.price * item.quantity;
    });

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Start transaction
    await beginTransaction();

    try {
      // Insert order
      const orderResult = await insertOrder({
        userId,
        orderNumber,
        total,
        paymentMethod,
        billingAddress: JSON.stringify(billingAddress),
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        notes
      });

      const orderId = orderResult.lastID;

      // Insert order items and generate game keys
      for (const item of cartItems) {
        const gameKey = generateGameKey();
        await insertOrderItem({
          orderId,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          gameKey
        });
      }

      // Clear cart
      await clearCart(userId);

      // Commit transaction
      await commitTransaction();

      res.json({
        message: 'Order created successfully',
        order: {
          id: orderId,
          orderNumber,
          total: total.toFixed(2),
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      });

    } catch (error) {
      await rollbackTransaction();
      throw error;
    }

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// Get user's orders
router.get('/history', authenticateToken, (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all(`
    SELECT o.id, o.order_number, o.total_amount, o.status, o.payment_method,
           o.created_at, COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count
    db.get('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId], (err, result) => {
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

// Get order details
router.get('/:orderId', authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const userId = req.userId;

  db.get(`
    SELECT o.*, COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ? AND o.user_id = ?
    GROUP BY o.id
  `, [orderId, userId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    db.all(`
      SELECT oi.*, p.title, p.image_url, p.platform
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Parse addresses
      try {
        order.billingAddress = JSON.parse(order.billing_address);
        order.shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : null;
      } catch (e) {
        order.billingAddress = {};
        order.shippingAddress = null;
      }

      delete order.billing_address;
      delete order.shipping_address;

      res.json({
        order: order,
        items: items
      });
    });
  });
});

// Reveal game key
router.post('/:orderId/items/:itemId/reveal', authenticateToken, (req, res) => {
  const { orderId, itemId } = req.params;
  const userId = req.userId;

  // Verify order ownership and item exists
  db.get(`
    SELECT oi.game_key, oi.is_revealed
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.id = ? AND o.id = ? AND o.user_id = ? AND o.status = 'delivered'
  `, [itemId, orderId, userId], (err, item) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!item) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    if (item.is_revealed) {
      return res.json({ gameKey: item.game_key });
    }

    // Mark as revealed
    db.run('UPDATE order_items SET is_revealed = 1, revealed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [itemId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to reveal key' });
        }

        res.json({ gameKey: item.game_key });
      });
  });
});

// Helper functions
function getCartItems(userId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT ci.product_id, ci.quantity, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.is_active = 1
    `, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function insertOrder(orderData) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO orders (user_id, order_number, total_amount, payment_method, billing_address, shipping_address, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [
      orderData.userId, orderData.orderNumber, orderData.total, orderData.paymentMethod,
      orderData.billingAddress, orderData.shippingAddress, orderData.notes
    ], function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function insertOrderItem(itemData) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO order_items (order_id, product_id, quantity, price, game_key)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(sql, [
      itemData.orderId, itemData.productId, itemData.quantity,
      itemData.price, itemData.gameKey
    ], function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function clearCart(userId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

function beginTransaction() {
  return new Promise((resolve, reject) => {
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function commitTransaction() {
  return new Promise((resolve, reject) => {
    db.run('COMMIT', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function rollbackTransaction() {
  return new Promise((resolve, reject) => {
    db.run('ROLLBACK', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `IK${timestamp}${random}`;
}

function generateGameKey() {
  // Generate a random game key (in production, this would be more sophisticated)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) key += '-';
  }
  return key;
}

module.exports = router;