import React from 'react';
import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';
import './product-card.css';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image_url} alt={product.title} />
        <div className="product-overlay">
          <Link href={`/products/${product.id}`} className="btn-view">
            View Details
          </Link>
          <button onClick={() => onAddToCart(product)} className="btn-cart">
            Add to Cart
          </button>
        </div>
      </div>

      <div className="product-info">
        <Link href={`/products/${product.id}`} className="product-title">
          {product.title}
        </Link>

        <p className="product-platform">{product.platform}</p>

        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(product.rating) ? 'filled' : 'empty'}
              />
            ))}
          </div>
          <span className="rating-value">({product.rating.toFixed(1)})</span>
        </div>

        <div className="product-price">
          <span className="price">${product.price}</span>
        </div>
      </div>
    </div>
  );
}
