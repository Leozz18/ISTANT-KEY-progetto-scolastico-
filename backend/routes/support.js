const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's support tickets
router.get('/tickets', authenticateToken, (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all(`
    SELECT id, subject, category, priority, status, created_at, updated_at
    FROM support_tickets
    WHERE user_id = ?
    ORDER BY updated_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset], (err, tickets) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count
    db.get('SELECT COUNT(*) as total FROM support_tickets WHERE user_id = ?', [userId], (err, result) => {
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

// Create new support ticket
router.post('/tickets', authenticateToken, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('category').isIn(['account', 'billing', 'technical', 'game_key', 'other']).withMessage('Valid category required'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Valid priority required'),
  body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { subject, category, priority, message } = req.body;
  const userId = req.userId;

  // Insert ticket
  db.run(`
    INSERT INTO support_tickets (user_id, subject, category, priority, status)
    VALUES (?, ?, ?, ?, 'open')
  `, [userId, subject, category, priority], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create ticket' });
    }

    const ticketId = this.lastID;

    // Insert first message
    db.run(`
      INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin)
      VALUES (?, ?, ?, 0)
    `, [ticketId, userId, message], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create ticket message' });
      }

      res.status(201).json({
        message: 'Support ticket created successfully',
        ticketId: ticketId
      });
    });
  });
});

// Get ticket details
router.get('/tickets/:ticketId', authenticateToken, (req, res) => {
  const { ticketId } = req.params;
  const userId = req.userId;

  // Get ticket info
  db.get(`
    SELECT st.*, u.username, u.email
    FROM support_tickets st
    JOIN users u ON st.user_id = u.id
    WHERE st.id = ? AND st.user_id = ?
  `, [ticketId, userId], (err, ticket) => {
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

// Add message to ticket
router.post('/tickets/:ticketId/messages', authenticateToken, [
  body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { ticketId } = req.params;
  const { message } = req.body;
  const userId = req.userId;

  // Verify ticket ownership and status
  db.get(`
    SELECT id, status FROM support_tickets
    WHERE id = ? AND user_id = ? AND status != 'closed'
  `, [ticketId, userId], (err, ticket) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found or closed' });
    }

    // Insert message
    db.run(`
      INSERT INTO ticket_messages (ticket_id, user_id, message, is_admin)
      VALUES (?, ?, ?, 0)
    `, [ticketId, userId, message], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to send message' });
      }

      // Update ticket updated_at
      db.run('UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [ticketId], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update ticket' });
          }

          res.json({ message: 'Message sent successfully' });
        });
    });
  });
});

// Close ticket
router.put('/tickets/:ticketId/close', authenticateToken, (req, res) => {
  const { ticketId } = req.params;
  const userId = req.userId;

  // Verify ticket ownership
  db.get(`
    SELECT id, status FROM support_tickets
    WHERE id = ? AND user_id = ?
  `, [ticketId, userId], (err, ticket) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({ error: 'Ticket is already closed' });
    }

    // Close ticket
    db.run(`
      UPDATE support_tickets
      SET status = 'closed', updated_at = CURRENT_TIMESTAMP, closed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [ticketId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to close ticket' });
      }

      res.json({ message: 'Ticket closed successfully' });
    });
  });
});

// Get FAQ categories and questions
router.get('/faq', (req, res) => {
  db.all(`
    SELECT category, question, answer, helpful_count
    FROM faq
    WHERE is_active = 1
    ORDER BY category, helpful_count DESC, created_at DESC
  `, [], (err, faqs) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Group by category
    const groupedFaqs = {};
    faqs.forEach(faq => {
      if (!groupedFaqs[faq.category]) {
        groupedFaqs[faq.category] = [];
      }
      groupedFaqs[faq.category].push({
        question: faq.question,
        answer: faq.answer,
        helpfulCount: faq.helpful_count
      });
    });

    res.json({ faq: groupedFaqs });
  });
});

// Mark FAQ as helpful
router.post('/faq/:faqId/helpful', (req, res) => {
  const { faqId } = req.params;

  db.run('UPDATE faq SET helpful_count = helpful_count + 1 WHERE id = ?',
    [faqId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark as helpful' });
      }

      res.json({ message: 'Thank you for your feedback' });
    });
});

// Search FAQ
router.get('/faq/search', (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 3) {
    return res.status(400).json({ error: 'Search query must be at least 3 characters' });
  }

  const searchTerm = `%${query}%`;

  db.all(`
    SELECT category, question, answer, helpful_count
    FROM faq
    WHERE is_active = 1 AND (question LIKE ? OR answer LIKE ?)
    ORDER BY helpful_count DESC
    LIMIT 20
  `, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ results });
  });
});

module.exports = router;