// INSTANT KEY - Frontend API & Animation System
class InstantKeyAPI {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
        this.token = localStorage.getItem('authToken');
    }

    // Authentication methods
    async login(credentials) {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (data.token) {
            this.token = data.token;
            localStorage.setItem('authToken', data.token);
        }
        return data;
    }

    async register(userData) {
        const response = await fetch(`${this.baseURL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    }

    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }

    // Product methods
    async getProducts(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`${this.baseURL}/products?${queryParams}`);
        return await response.json();
    }

    async getProduct(id) {
        const response = await fetch(`${this.baseURL}/products/${id}`);
        return await response.json();
    }

    async searchProducts(query) {
        const response = await fetch(`${this.baseURL}/products/search?q=${encodeURIComponent(query)}`);
        return await response.json();
    }

    // Cart methods
    async getCart() {
        const response = await fetch(`${this.baseURL}/orders/cart`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return await response.json();
    }

    async addToCart(productId, quantity = 1) {
        const response = await fetch(`${this.baseURL}/orders/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ productId, quantity })
        });
        return await response.json();
    }

    async updateCartItem(itemId, quantity) {
        const response = await fetch(`${this.baseURL}/orders/cart/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ quantity })
        });
        return await response.json();
    }

    async removeFromCart(itemId) {
        const response = await fetch(`${this.baseURL}/orders/cart/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return await response.json();
    }

    // User methods
    async getProfile() {
        const response = await fetch(`${this.baseURL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return await response.json();
    }

    // Support methods
    async getFAQs() {
        const response = await fetch(`${this.baseURL}/support/faq`);
        return await response.json();
    }

    async createSupportTicket(ticketData) {
        const response = await fetch(`${this.baseURL}/support/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(ticketData)
        });
        return await response.json();
    }
}

// Animation system
class InstantKeyAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupLoadingAnimations();
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, this.observerOptions);

        // Observe elements with animation classes
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    setupHoverEffects() {
        // Enhanced card hover effects
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                const img = card.querySelector('img');
                const overlay = card.querySelector('.card-overlay');

                if (img) img.style.transform = 'scale(1.05)';
                if (overlay) overlay.style.opacity = '1';
            });

            card.addEventListener('mouseleave', (e) => {
                const img = card.querySelector('img');
                const overlay = card.querySelector('.card-overlay');

                if (img) img.style.transform = 'scale(1)';
                if (overlay) overlay.style.opacity = '0';
            });
        });
    }

    setupLoadingAnimations() {
        // Add loading states to buttons
        document.querySelectorAll('.btn-loading').forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.add('loading');
                this.innerHTML = '<span class="spinner"></span> Loading...';
            });
        });
    }

    // Utility methods
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';

        const start = performance.now();
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            if (progress < 1) {
                element.style.opacity = progress;
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = '1';
            }
        };

        requestAnimationFrame(animate);
    }

    static slideIn(element, direction = 'up', duration = 300) {
        const directions = {
            up: 'translateY(20px)',
            down: 'translateY(-20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };

        element.style.transform = directions[direction];
        element.style.opacity = '0';
        element.style.display = 'block';

        const start = performance.now();
        const animate = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            if (progress < 1) {
                element.style.opacity = progress;
                element.style.transform = `translateY(${20 * (1 - progress)}px)`;
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        };

        requestAnimationFrame(animate);
    }

    static showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// UI Components
class InstantKeyUI {
    static createProductCard(product) {
        return `
            <a href="product_details.html?id=${product.id}" class="game-card group animate-on-scroll">
                <div class="bg-surface-container-high rounded-xl overflow-hidden hover:bg-surface-container-highest transition-all duration-300 ring-1 ring-white/5 hover:ring-primary/20">
                    <div class="relative">
                        <img class="w-full aspect-[3/4] object-cover transition-transform duration-500"
                             alt="${product.title} game cover"
                             src="${product.image_url || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=300&h=400&fit=crop&crop=center'}"/>
                        ${product.discount_percentage ? `<div class="absolute top-3 right-3 bg-error text-on-error px-2 py-1 font-label text-xs font-bold uppercase rounded">-${product.discount_percentage}%</div>` : ''}
                        <div class="card-overlay absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 flex items-center justify-center">
                            <span class="material-symbols-outlined text-white text-4xl">visibility</span>
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-headline font-bold text-lg mb-1">${product.title}</h3>
                        <p class="text-on-surface-variant text-sm mb-2">${product.developer || 'Developer'}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-primary font-headline font-bold text-xl">$${product.price}</span>
                            <span class="text-on-surface-variant text-xs uppercase">${product.platform}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }

    static createCartItem(item) {
        return `
            <div class="cart-item flex items-center gap-4 p-4 bg-surface-container-high rounded-lg" data-item-id="${item.id}">
                <img src="${item.image_url}" alt="${item.title}" class="w-16 h-16 object-cover rounded">
                <div class="flex-1">
                    <h4 class="font-bold">${item.title}</h4>
                    <p class="text-sm text-on-surface-variant">${item.platform}</p>
                    <p class="text-primary font-bold">$${item.price}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="quantity-btn px-2 py-1 bg-surface-container-low rounded" data-action="decrease">-</button>
                    <span class="quantity-display px-3">${item.quantity}</span>
                    <button class="quantity-btn px-2 py-1 bg-surface-container-low rounded" data-action="increase">+</button>
                </div>
                <button class="remove-btn text-error hover:text-error-dim ml-4">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `;
    }

    static showLoadingSpinner(container) {
        container.innerHTML = `
            <div class="loading-spinner flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        `;
    }

    static hideLoadingSpinner(container) {
        const spinner = container.querySelector('.loading-spinner');
        if (spinner) spinner.remove();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize API and animations
    window.InstantKeyAPI = new InstantKeyAPI();
    window.InstantKeyAnimations = new InstantKeyAnimations();
    window.InstantKeyUI = InstantKeyUI;

    // Check authentication status
    const token = localStorage.getItem('authToken');
    if (token) {
        // Update UI for logged in user
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = 'block';
        });
        document.querySelectorAll('.auth-hidden').forEach(el => {
            el.style.display = 'none';
        });
    }

    // Setup global error handling
    window.addEventListener('unhandledrejection', (event) => {
        console.error('API Error:', event.reason);
        InstantKeyAnimations.showNotification('An error occurred. Please try again.', 'error');
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InstantKeyAPI, InstantKeyAnimations, InstantKeyUI };
}