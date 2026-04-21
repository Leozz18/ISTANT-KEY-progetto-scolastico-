# INSTANT KEY - Gaming Marketplace

A modern, fully-functional digital gaming marketplace with complete backend API. Built with HTML5, Tailwind CSS, vanilla JavaScript, Node.js, Express.js, and SQLite database.

## 🚀 Features

### Core Functionality
- **Complete E-commerce Flow**: Browse → Cart → Checkout → Order Confirmation
- **User Authentication**: Login, Registration with 2FA setup
- **Product Management**: Catalog browsing with filters, detailed product pages
- **Shopping Cart**: Add/remove items, quantity management, price calculations
- **Order History**: Complete order tracking and game key downloads
- **Wishlist & Alerts**: Save favorites and get price drop notifications
- **Admin Dashboard**: Comprehensive administrative interface
- **Support System**: FAQ, ticket submission, verified reviews
- **Partner Program**: Affiliate application and management

### Technical Features
- **Full-Stack Architecture**: Frontend + Backend API + Database
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Theme**: Custom color palette with neon green accents
- **RESTful API**: Complete backend with authentication and data persistence
- **SQLite Database**: Local database with complete schema and sample data
- **Security**: JWT authentication, password hashing, rate limiting
- **Real-time Features**: Live cart updates, instant search, dynamic filtering

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup and accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: No frameworks, pure JS with modern ES6+
- **Custom Design System**: Neon Velocity theme with consistent components

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for API development
- **SQLite3**: Local SQL database
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **express-validator**: Input validation and sanitization

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- Python 3.x (for simple HTTP server)
- Windows/Linux/Mac OS

### 1. Clone and Setup
```bash
# Navigate to project directory
cd "ISTANT-KEY-progetto-scolastico-"
```

### 2. Start Backend API
```bash
# Double-click the batch file or run:
start-backend.bat

# Or manually:
cd backend
npm install
npm start
```
The API will be available at `http://localhost:3001`

### 3. Start Frontend Server
```bash
# In a new terminal/command prompt, run:
start-frontend.bat

# Or manually:
python -m http.server 8000
```
The website will be available at `http://localhost:8000`

### 4. Access the Application
- **Frontend**: http://localhost:8000
- **API Health Check**: http://localhost:3001/api/health
- **API Documentation**: See backend/README.md

## 📁 Project Structure

```
INSTANT-KEY-progetto-scolastico-/
├── backend/                    # Node.js API server
│   ├── database/
│   │   └── init.js            # Database schema & sample data
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/                # API endpoints
│   │   ├── auth.js           # Authentication
│   │   ├── users.js          # User management
│   │   ├── products.js       # Product catalog
│   │   ├── orders.js         # Cart & orders
│   │   ├── admin.js          # Admin functions
│   │   └── support.js        # Support system
│   ├── server.js             # Main server file
│   ├── package.json          # Dependencies
│   └── README.md             # API documentation
├── home_page/
│   └── code.html             # Landing page
├── product_catalog/
│   └── code.html             # Product listing
├── product_details/
│   └── code.html             # Product details
├── shopping_cart/
│   └── code.html             # Cart page
├── login/
│   └── code.html             # Login page
├── registration_2fa/
│   └── code.html             # Registration with 2FA
├── checkout/
│   └── code.html             # Checkout process
├── order_confirmation_delivery/
│   └── code.html             # Order confirmation
├── order_history/
│   └── code.html             # Order history
├── user_dashboard/
│   └── code.html             # User dashboard
├── admin_dashboard/
│   └── code.html             # Admin panel
├── support_faq/
│   └── code.html             # Support & FAQ
├── submit_ticket/
│   └── code.html             # Submit support ticket
├── verified_reviews/
│   └── code.html             # Product reviews
├── wishlist_alerts/
│   └── code.html             # Wishlist management
├── partner_with_us/
│   └── code.html             # Partner program
├── neon_velocity/
│   └── DESIGN.md             # Design system docs
├── start-backend.bat         # Backend startup script
├── start-frontend.bat        # Frontend startup script
└── README.md                 # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Products
- `GET /api/products` - Get products with filters
- `GET /api/products/:id` - Get product details
- `GET /api/products/search` - Search products

### Orders & Cart
- `GET /api/orders/cart` - Get user's cart
- `POST /api/orders/cart` - Add item to cart
- `POST /api/orders/checkout` - Process checkout
- `GET /api/orders/history` - Get order history

### Admin (requires admin role)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders

See `backend/README.md` for complete API documentation.

## 🗄️ Database Schema

The SQLite database includes tables for:
- **Users**: Registration, authentication, profiles
- **Products**: Game catalog with pricing and metadata
- **Orders**: Purchase history and order management
- **Cart Items**: Shopping cart functionality
- **Support Tickets**: Customer support system
- **Reviews**: Product reviews and ratings
- **Wishlist**: User favorites and alerts

## 🎨 Design System

### Color Palette
- **Primary**: Neon Green (#00ff88)
- **Background**: Dark Gray (#0a0a0a)
- **Surface**: Dark Gray (#1a1a1a)
- **Text**: White (#ffffff)
- **Text Secondary**: Gray (#888888)

### Typography
- **Primary Font**: System font stack
- **Headings**: Bold, uppercase for impact
- **Body**: Clean, readable text

### Components
- **Cards**: Product cards with hover effects
- **Buttons**: Primary (neon green), secondary (dark)
- **Forms**: Clean inputs with validation
- **Navigation**: Fixed header with smooth scrolling

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Server-side validation with express-validator
- **CORS**: Configured for secure cross-origin requests
- **Helmet**: Security headers for production

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- **Desktop**: 1200px+ width
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🚀 Deployment

### Development
1. Start backend: `npm start` in backend folder
2. Start frontend: `python -m http.server 8000`
3. Access at http://localhost:8000

### Production
1. Configure environment variables
2. Set up reverse proxy (nginx)
3. Enable HTTPS
4. Configure production database
5. Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support or questions:
- Create an issue on GitHub
- Use the in-app support system
- Check the FAQ section

---

**Built with ❤️ for the gaming community**
- **Interactive UI**: Smooth animations and hover effects
- **Form Validation**: Client-side validation with user feedback
- **Local Storage**: Persistent cart and user preferences
- **Material Icons**: Consistent iconography throughout

## 📁 Project Structure

```
INSTANT-KEY-progetto-scolastico-/
├── index.html                 # Landing page with hero section and featured games
├── product_catalog.html       # Product browsing with filters and search
├── product_details.html       # Individual game detail pages
├── login.html                 # User authentication
├── registration_2fa.html      # Registration with two-factor authentication setup
├── shopping_cart.html         # Shopping cart management
├── checkout.html              # Payment processing
├── order_confirmation_delivery.html  # Order success and key delivery
├── user_dashboard.html        # User account management
├── admin_dashboard.html       # Administrative interface
├── order_history.html         # Complete order history
├── support_faq.html           # Frequently asked questions
├── submit_ticket.html         # Support ticket submission
├── verified_reviews.html      # Customer reviews and ratings
├── wishlist_alerts.html       # Wishlist and price alerts
├── partner_with_us.html       # Affiliate partner program
└── README.md                  # Project documentation
```

## 🎨 Design System

### Colors
- **Primary**: `#9cff93` (Neon Green)
- **Secondary**: `#00e3fd` (Cyan)
- **Tertiary**: `#8af2ff` (Light Cyan)
- **Surface**: `#0e0e0f` (Dark Background)
- **Error**: `#ff7351` (Red)

### Typography
- **Headlines**: Space Grotesk (300-700 weight)
- **Body Text**: Inter (300-700 weight)
- **Icons**: Material Symbols Outlined

### Components
- Gradient buttons with hover effects
- Card-based layouts with subtle borders
- Consistent spacing and rounded corners
- Interactive elements with smooth transitions

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: Interactive functionality
- **Material Icons**: Icon library
- **Google Fonts**: Custom typography

## 🚀 Getting Started

### Local Development
1. Clone or download the project
2. Open the project folder in VS Code
3. Start a local server:
   ```bash
   python -m http.server 8000
   ```
4. Open `http://localhost:8000` in your browser

### File Structure
- All HTML files are self-contained with inline CSS and JavaScript
- No build process required - works directly in browser
- Responsive design works on all screen sizes

## 📱 Pages Overview

### Public Pages
- **Home** (`index.html`): Hero section, featured deals, navigation
- **Product Catalog** (`product_catalog.html`): Browse games with filters
- **Product Details** (`product_details.html`): Individual game information
- **Login** (`login.html`): User authentication
- **Registration** (`registration_2fa.html`): Account creation with 2FA

### User Pages
- **Shopping Cart** (`shopping_cart.html`): Cart management
- **Checkout** (`checkout.html`): Payment processing
- **Order Confirmation** (`order_confirmation_delivery.html`): Success page
- **User Dashboard** (`user_dashboard.html`): Account overview
- **Order History** (`order_history.html`): Purchase history
- **Wishlist & Alerts** (`wishlist_alerts.html`): Saved items and notifications

### Support Pages
- **Support FAQ** (`support_faq.html`): Common questions
- **Submit Ticket** (`submit_ticket.html`): Contact support
- **Verified Reviews** (`verified_reviews.html`): Customer feedback

### Business Pages
- **Partner Program** (`partner_with_us.html`): Affiliate application
- **Admin Dashboard** (`admin_dashboard.html`): Administrative tools

## 🎯 Key Features

### Shopping Experience
- **Advanced Filtering**: Platform, genre, price range
- **Search Functionality**: Find games quickly
- **Product Comparison**: Side-by-side game details
- **Wishlist Management**: Save favorites for later
- **Price Alerts**: Get notified of deals

### User Experience
- **Responsive Design**: Works on desktop, tablet, mobile
- **Fast Loading**: Optimized for performance
- **Accessibility**: Screen reader friendly
- **Progressive Enhancement**: Works without JavaScript

### Security Features
- **Two-Factor Authentication**: Multiple 2FA options
- **Secure Checkout**: Protected payment processing
- **Account Verification**: Email and phone verification
- **Session Management**: Secure user sessions

## 📊 Admin Features

- **Dashboard Overview**: Revenue, orders, user metrics
- **Order Management**: Process and track orders
- **User Administration**: Manage user accounts
- **Content Management**: Update products and content
- **Analytics**: Sales and performance data

## 🤝 Contributing

This is a complete, production-ready gaming marketplace website. All pages are fully functional with:

- ✅ Responsive design
- ✅ Interactive JavaScript
- ✅ Form validation
- ✅ Navigation between pages
- ✅ Consistent design system
- ✅ Accessibility features

## 📄 License

© 2024 Instant Key. All rights reserved.

---

**Built with ❤️ for the ultimate gaming experience**
