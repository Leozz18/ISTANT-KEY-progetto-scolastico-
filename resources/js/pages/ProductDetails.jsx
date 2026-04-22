import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Star } from 'lucide-react';
import axios from 'axios';
import '../styles/product-details.css';

export default function ProductDetails({ auth, productId }) {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProductAndReviews();
  }, [productId]);

  const fetchProductAndReviews = async () => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        axios.get(`/api/products/${productId}`),
        axios.get(`/api/products/${productId}/reviews`),
      ]);

      setProduct(productRes.data);
      setReviews(reviewsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!auth?.user) {
      alert('Please login to submit a review');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post('/api/reviews', {
        product_id: productId,
        rating,
        comment,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      setRating(5);
      setComment('');
      fetchProductAndReviews();
    } catch (error) {
      alert('Error submitting review: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
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

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <>
      <Header auth={auth} />

      <main className="main-content">
        <div className="container">
          <div className="product-details">
            <div className="product-image-section">
              <img src={product.image_url} alt={product.title} />
            </div>

            <div className="product-info-section">
              <h1>{product.title}</h1>
              <p className="publisher">By {product.publisher}</p>

              <div className="rating-section">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating) ? 'filled' : 'empty'}
                    />
                  ))}
                </div>
                <span>{product.rating.toFixed(1)} out of 5</span>
              </div>

              <p className="description">{product.description}</p>

              <div className="product-meta">
                <div className="meta-item">
                  <strong>Platform:</strong> {product.platform}
                </div>
                <div className="meta-item">
                  <strong>Genre:</strong> {product.genre}
                </div>
                <div className="meta-item">
                  <strong>Release Date:</strong> {new Date(product.release_date).toLocaleDateString()}
                </div>
              </div>

              <div className="price-section">
                <span className="price">${product.price}</span>
                <button onClick={handleAddToCart} className="btn-primary btn-large">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <section className="reviews-section">
            <h2>Customer Reviews</h2>

            {/* Submit Review Form */}
            {auth?.user && (
              <form onSubmit={handleSubmitReview} className="review-form">
                <h3>Write a Review</h3>

                <div className="form-group">
                  <label>Rating</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(value => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className={`rating-btn ${value <= rating ? 'active' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this game..."
                    required
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <strong>{review.user.name}</strong>
                    <span className="review-rating">
                      {'★'.repeat(review.rating)}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <small className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
