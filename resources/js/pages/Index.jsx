import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import '../styles/index.css';

export default function Index({ auth }) {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/products/featured')
      .then(response => {
        setFeatured(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching featured products:', error);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.title} added to cart!`);
  };

  return (
    <>
      <Header auth={auth} />

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">INSTANT KEY</h1>
            <p className="hero-subtitle">
              Get your favorite gaming keys delivered instantly
            </p>
            <Link href="/products" className="btn-primary btn-large">
              Start Shopping
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-section">
          <div className="container">
            <h2 className="section-title">Featured Games</h2>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="products-grid">
                {featured.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <div className="container">
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Instant Delivery</h3>
                <p>Get your keys instantly after payment</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure</h3>
                <p>Safe transactions with encrypted payments</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Best Prices</h3>
                <p>Competitive prices on all games</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤝</div>
                <h3>24/7 Support</h3>
                <p>Dedicated support team ready to help</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
