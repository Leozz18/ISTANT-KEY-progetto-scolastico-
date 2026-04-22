import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import '../styles/confirmation.css';

export default function OrderConfirmation({ auth, orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keysRevealed, setKeysRevealed] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      setOrder(response.data);
      setKeysRevealed(response.data.game_key_revealed);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setLoading(false);
    }
  };

  const handleRevealKeys = async () => {
    try {
      await axios.post(`/api/orders/${orderId}/reveal-key`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      fetchOrder();
      setKeysRevealed(true);
    } catch (error) {
      alert('Error revealing keys: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!order) return <div className="error">Order not found</div>;

  return (
    <>
      <Header auth={auth} />

      <main className="main-content">
        <div className="container">
          <div className="confirmation-header">
            <h1>Order Confirmed! 🎉</h1>
            <p>Your order has been successfully processed</p>
          </div>

          <div className="confirmation-details">
            <h2>Order Details</h2>

            <div className="detail-section">
              <div className="detail-item">
                <label>Order ID</label>
                <p>#{order.id}</p>
              </div>

              <div className="detail-item">
                <label>Date</label>
                <p>{new Date(order.created_at).toLocaleDateString()}</p>
              </div>

              <div className="detail-item">
                <label>Total Amount</label>
                <p className="amount">${order.total_price}</p>
              </div>

              <div className="detail-item">
                <label>Status</label>
                <p className="status">{order.status}</p>
              </div>

              <div className="detail-item">
                <label>Payment Method</label>
                <p>{order.payment_method}</p>
              </div>
            </div>

            <h3>Games Purchased</h3>
            <div className="games-list">
              {order.products?.map(product => (
                <div key={product.id} className="game-item">
                  <div className="game-info">
                    <h4>{product.title}</h4>
                    <p className="platform">{product.platform}</p>
                  </div>
                  <div className="game-price">
                    ${product.pivot.price}
                  </div>
                  {keysRevealed && (
                    <div className="game-key">
                      <strong>Key:</strong>
                      <code>{product.pivot.game_key}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!keysRevealed && (
              <button
                onClick={handleRevealKeys}
                className="btn-primary btn-large"
              >
                Reveal Game Keys
              </button>
            )}

            <div className="next-steps">
              <h3>Next Steps</h3>
              <ol>
                <li>Your keys are ready for download</li>
                <li>Check your email for order confirmation</li>
                <li>You can access your keys anytime from your account</li>
              </ol>
            </div>

            <div className="action-buttons">
              <a href="/products" className="btn-primary">
                Continue Shopping
              </a>
              <a href="/orders" className="btn-link">
                View All Orders
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
