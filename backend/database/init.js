const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'instant_key.db');

// Create database directory if it doesn't exist
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        phone VARCHAR(20),
        avatar_url VARCHAR(255),
        is_admin BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        two_factor_secret VARCHAR(255),
        two_factor_method VARCHAR(20), -- 'authenticator', 'sms', 'email'
        balance DECIMAL(10,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        status VARCHAR(20) DEFAULT 'active' -- 'active', 'suspended', 'banned'
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
        reject(err);
        return;
      }

      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          original_price DECIMAL(10,2),
          platform VARCHAR(50) NOT NULL, -- 'pc', 'playstation', 'xbox', 'nintendo', 'mobile'
          genre VARCHAR(100),
          developer VARCHAR(100),
          publisher VARCHAR(100),
          release_date DATE,
          image_url VARCHAR(255),
          gallery_images TEXT, -- JSON array of image URLs
          system_requirements TEXT, -- JSON object
          features TEXT, -- JSON array of features
          rating DECIMAL(3,1), -- 0.0 to 10.0
          review_count INTEGER DEFAULT 0,
          stock_quantity INTEGER DEFAULT -1, -- -1 means unlimited
          is_active BOOLEAN DEFAULT TRUE,
          is_featured BOOLEAN DEFAULT FALSE,
          discount_percentage INTEGER DEFAULT 0,
          tags TEXT, -- JSON array of tags
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating products table:', err.message);
          reject(err);
          return;
        }

        // Shopping cart table
        db.run(`
          CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
            UNIQUE(user_id, product_id)
          )
        `, (err) => {
          if (err) {
            console.error('Error creating cart_items table:', err.message);
            reject(err);
            return;
          }

          // Orders table
          db.run(`
            CREATE TABLE IF NOT EXISTS orders (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              order_number VARCHAR(50) UNIQUE NOT NULL,
              total_amount DECIMAL(10,2) NOT NULL,
              status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
              payment_method VARCHAR(50),
              payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
              shipping_address TEXT, -- JSON object
              billing_address TEXT, -- JSON object
              notes TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
          `, (err) => {
            if (err) {
              console.error('Error creating orders table:', err.message);
              reject(err);
              return;
            }

            // Order items table
            db.run(`
              CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price DECIMAL(10,2) NOT NULL, -- Price at time of purchase
                game_key VARCHAR(255), -- The actual game key/license
                is_revealed BOOLEAN DEFAULT FALSE,
                revealed_at DATETIME,
                FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
              )
            `, (err) => {
              if (err) {
                console.error('Error creating order_items table:', err.message);
                reject(err);
                return;
              }

              // Wishlist table
              db.run(`
                CREATE TABLE IF NOT EXISTS wishlist (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER NOT NULL,
                  product_id INTEGER NOT NULL,
                  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
                  UNIQUE(user_id, product_id)
                )
              `, (err) => {
                if (err) {
                  console.error('Error creating wishlist table:', err.message);
                  reject(err);
                  return;
                }

                // Price alerts table
                db.run(`
                  CREATE TABLE IF NOT EXISTS price_alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    target_price DECIMAL(10,2) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_notified DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
                  )
                `, (err) => {
                  if (err) {
                    console.error('Error creating price_alerts table:', err.message);
                    reject(err);
                    return;
                  }

                  // Reviews table
                  db.run(`
                    CREATE TABLE IF NOT EXISTS reviews (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      user_id INTEGER NOT NULL,
                      product_id INTEGER NOT NULL,
                      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                      title VARCHAR(255),
                      comment TEXT,
                      is_verified BOOLEAN DEFAULT FALSE,
                      helpful_votes INTEGER DEFAULT 0,
                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
                      UNIQUE(user_id, product_id)
                    )
                  `, (err) => {
                    if (err) {
                      console.error('Error creating reviews table:', err.message);
                      reject(err);
                      return;
                    }

                    // Support tickets table
                    db.run(`
                      CREATE TABLE IF NOT EXISTS support_tickets (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        subject VARCHAR(255) NOT NULL,
                        category VARCHAR(50) NOT NULL,
                        priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
                        status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'waiting_user', 'resolved', 'closed'
                        description TEXT NOT NULL,
                        attachments TEXT, -- JSON array of file URLs
                        assigned_to INTEGER, -- Admin user ID
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        resolved_at DATETIME,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                        FOREIGN KEY (assigned_to) REFERENCES users (id)
                      )
                    `, (err) => {
                      if (err) {
                        console.error('Error creating support_tickets table:', err.message);
                        reject(err);
                        return;
                      }

                      // Ticket messages table
                      db.run(`
                        CREATE TABLE IF NOT EXISTS ticket_messages (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          ticket_id INTEGER NOT NULL,
                          user_id INTEGER NOT NULL,
                          message TEXT NOT NULL,
                          is_admin BOOLEAN DEFAULT FALSE,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (ticket_id) REFERENCES support_tickets (id) ON DELETE CASCADE,
                          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                        )
                      `, (err) => {
                        if (err) {
                          console.error('Error creating ticket_messages table:', err.message);
                          reject(err);
                          return;
                        }

                        // Partners/Affiliates table
                        db.run(`
                          CREATE TABLE IF NOT EXISTS partners (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER NOT NULL,
                            company_name VARCHAR(255),
                            website VARCHAR(255),
                            audience_size VARCHAR(50),
                            content_types TEXT, -- JSON array
                            status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'active', 'suspended'
                            commission_rate DECIMAL(5,2) DEFAULT 15.00,
                            total_earnings DECIMAL(10,2) DEFAULT 0.00,
                            pending_earnings DECIMAL(10,2) DEFAULT 0.00,
                            application_data TEXT, -- JSON object with application details
                            approved_at DATETIME,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                          )
                        `, (err) => {
                          if (err) {
                            console.error('Error creating partners table:', err.message);
                            reject(err);
                            return;
                          }

                          // Partner commissions table
                          db.run(`
                            CREATE TABLE IF NOT EXISTS partner_commissions (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              partner_id INTEGER NOT NULL,
                              order_id INTEGER NOT NULL,
                              amount DECIMAL(10,2) NOT NULL,
                              status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
                              paid_at DATETIME,
                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                              FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE,
                              FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
                            )
                          `, (err) => {
                            if (err) {
                              console.error('Error creating partner_commissions table:', err.message);
                              reject(err);
                              return;
                            }

                            // Insert sample data
                            insertSampleData(db)
                              .then(() => {
                                console.log('Database initialized successfully with sample data');
                                resolve();
                              })
                              .catch(reject);
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

async function insertSampleData(db) {
  return new Promise((resolve, reject) => {
    // Insert sample products
    const products = [
      {
        title: 'Cyberpunk 2077',
        description: 'An open-world, action-adventure RPG set in the dark future of Night City.',
        price: 29.99,
        original_price: 59.99,
        platform: 'pc',
        genre: 'RPG',
        developer: 'CD Projekt RED',
        publisher: 'CD Projekt',
        release_date: '2020-12-10',
        image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop&crop=center',
        rating: 7.2,
        review_count: 15420,
        is_featured: true,
        discount_percentage: 50
      },
      {
        title: 'The Witcher 3: Wild Hunt',
        description: 'The third installment in the series, featuring a vast open world and deep storytelling.',
        price: 19.99,
        original_price: 39.99,
        platform: 'pc',
        genre: 'RPG',
        developer: 'CD Projekt RED',
        publisher: 'CD Projekt',
        release_date: '2015-05-19',
        image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop&crop=center',
        rating: 9.7,
        review_count: 25680,
        is_featured: true,
        discount_percentage: 50
      },
      {
        title: 'Elden Ring',
        description: 'An action RPG adventure set within a world created by Hidetaka Miyazaki and George R.R. Martin.',
        price: 49.99,
        original_price: 59.99,
        platform: 'pc',
        genre: 'Action RPG',
        developer: 'FromSoftware',
        publisher: 'Bandai Namco',
        release_date: '2022-02-25',
        image_url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop&crop=center',
        rating: 9.5,
        review_count: 18950,
        is_featured: true,
        discount_percentage: 17
      }
    ];

    let completed = 0;
    const total = products.length;

    products.forEach(product => {
      db.run(`
        INSERT OR IGNORE INTO products
        (title, description, price, original_price, platform, genre, developer, publisher, release_date, image_url, rating, review_count, is_featured, discount_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.title, product.description, product.price, product.original_price,
        product.platform, product.genre, product.developer, product.publisher,
        product.release_date, product.image_url, product.rating, product.review_count,
        product.is_featured, product.discount_percentage
      ], function(err) {
        if (err) {
          console.error('Error inserting sample product:', err.message);
          reject(err);
          return;
        }

        completed++;
        if (completed === total) {
          console.log('Sample products inserted successfully');
          resolve();
        }
      });
    });
  });
}

module.exports = { db, initDatabase };