const express = require('express');
const { db } = require('../database/init');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all products with filtering and pagination
router.get('/', optionalAuth, (req, res) => {
  const {
    page = 1,
    limit = 20,
    platform,
    genre,
    minPrice,
    maxPrice,
    sort = 'created_at',
    order = 'desc',
    search,
    featured
  } = req.query;

  const offset = (page - 1) * limit;
  let whereConditions = ['is_active = 1'];
  let whereParams = [];

  // Build WHERE clause
  if (platform) {
    whereConditions.push('platform = ?');
    whereParams.push(platform);
  }

  if (genre) {
    whereConditions.push('genre LIKE ?');
    whereParams.push(`%${genre}%`);
  }

  if (minPrice) {
    whereConditions.push('price >= ?');
    whereParams.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    whereConditions.push('price <= ?');
    whereParams.push(parseFloat(maxPrice));
  }

  if (search) {
    whereConditions.push('(title LIKE ? OR description LIKE ? OR developer LIKE ? OR publisher LIKE ?)');
    const searchTerm = `%${search}%`;
    whereParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (featured === 'true') {
    whereConditions.push('is_featured = 1');
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Validate sort field
  const allowedSortFields = ['title', 'price', 'rating', 'created_at', 'release_date'];
  const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
  const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const sql = `
    SELECT id, title, description, price, original_price, platform, genre,
           developer, publisher, release_date, image_url, rating, review_count,
           is_featured, discount_percentage, created_at
    FROM products
    ${whereClause}
    ORDER BY ${sortField} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;

  // Get products
  db.all(sql, [...whereParams, limit, offset], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count
    db.get(countSql, whereParams, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Add wishlist status if user is authenticated
      if (req.userId) {
        const productIds = products.map(p => p.id);
        if (productIds.length > 0) {
          const wishlistSql = `
            SELECT product_id FROM wishlist
            WHERE user_id = ? AND product_id IN (${productIds.map(() => '?').join(',')})
          `;
          db.all(wishlistSql, [req.userId, ...productIds], (err, wishlistItems) => {
            if (!err) {
              const wishlistSet = new Set(wishlistItems.map(item => item.product_id));
              products.forEach(product => {
                product.isInWishlist = wishlistSet.has(product.id);
              });
            }
            sendResponse(products, result.total);
          });
        } else {
          sendResponse(products, result.total);
        }
      } else {
        sendResponse(products, result.total);
      }

      function sendResponse(products, total) {
        res.json({
          products: products,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            pages: Math.ceil(total / limit)
          }
        });
      }
    });
  });
});

// Get single product by ID
router.get('/:id', optionalAuth, (req, res) => {
  const productId = req.params.id;

  db.get(`
    SELECT id, title, description, price, original_price, platform, genre,
           developer, publisher, release_date, image_url, gallery_images,
           system_requirements, features, rating, review_count,
           is_featured, discount_percentage, tags, created_at
    FROM products
    WHERE id = ? AND is_active = 1
  `, [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Parse JSON fields
    try {
      product.galleryImages = product.gallery_images ? JSON.parse(product.gallery_images) : [];
      product.systemRequirements = product.system_requirements ? JSON.parse(product.system_requirements) : {};
      product.features = product.features ? JSON.parse(product.features) : [];
      product.tags = product.tags ? JSON.parse(product.tags) : [];
    } catch (e) {
      // If JSON parsing fails, set defaults
      product.galleryImages = [];
      product.systemRequirements = {};
      product.features = [];
      product.tags = [];
    }

    // Remove raw JSON fields
    delete product.gallery_images;
    delete product.system_requirements;

    // Add wishlist status if user is authenticated
    if (req.userId) {
      db.get('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
        [req.userId, productId], (err, wishlistItem) => {
          product.isInWishlist = !!wishlistItem;
          sendProduct(product);
        });
    } else {
      product.isInWishlist = false;
      sendProduct(product);
    }

    function sendProduct(product) {
      res.json({ product });
    }
  });
});

// Get product reviews
router.get('/:id/reviews', (req, res) => {
  const productId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all(`
    SELECT r.id, r.rating, r.title, r.comment, r.is_verified, r.helpful_votes, r.created_at,
           u.username, u.avatar_url, u.first_name, u.last_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `, [productId, limit, offset], (err, reviews) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count
    db.get('SELECT COUNT(*) as total FROM reviews WHERE product_id = ?', [productId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        reviews: reviews,
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

// Get featured products
router.get('/featured/list', (req, res) => {
  db.all(`
    SELECT id, title, price, original_price, platform, image_url, rating, discount_percentage
    FROM products
    WHERE is_featured = 1 AND is_active = 1
    ORDER BY created_at DESC
    LIMIT 8
  `, [], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ products });
  });
});

// Get platform statistics
router.get('/stats/platforms', (req, res) => {
  db.all(`
    SELECT platform, COUNT(*) as count
    FROM products
    WHERE is_active = 1
    GROUP BY platform
    ORDER BY count DESC
  `, [], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ platforms: stats });
  });
});

// Get genre statistics
router.get('/stats/genres', (req, res) => {
  db.all(`
    SELECT genre, COUNT(*) as count
    FROM products
    WHERE is_active = 1 AND genre IS NOT NULL
    GROUP BY genre
    ORDER BY count DESC
    LIMIT 10
  `, [], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ genres: stats });
  });
});

// Search suggestions
router.get('/search/suggestions', (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 2) {
    return res.json({ suggestions: [] });
  }

  db.all(`
    SELECT DISTINCT title as suggestion
    FROM products
    WHERE is_active = 1 AND title LIKE ?
    ORDER BY title
    LIMIT 5
  `, [`${query}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      suggestions: results.map(r => r.suggestion)
    });
  });
});

module.exports = router;