import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import '../styles/orders.css';

export default function OrderHistory({ auth }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      setOrders(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleRevealKey = async (orderId) => {
    try {
      await axios.post(`/api/orders/${orderId}/reveal-key`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      fetchOrders();
    } catch (error) {
      alert('Error revealing key: ' + error.message);
    }
  };

  return (
    <>
      <Header auth={auth} />

      <main className="main-content">
        <div className="container">
          <h1 className="page-title">Order History</h1>

          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <p>You haven't made any orders yet</p>
              <a href="/products" className="btn-primary">
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.id}</h3>
                    <span className={`status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <span>Date:</span>
                      <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Total:</span>
                      <strong>${order.total_price}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Items:</span>
                      <strong>{order.products?.length || 0} games</strong>
                    </div>
                  </div>

                  <div className="order-products">
                    {order.products?.map(product => (
                      <div key={product.id} className="product-item">
                        <span>{product.title}</span>
                        <span className="price">${product.pivot.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-actions">
                    <a href={`/orders/${order.id}`} className="btn-link">
                      View Details
                    </a>
                    {!order.game_key_revealed && (
                      <button
                        onClick={() => handleRevealKey(order.id)}
                        className="btn-primary"
                      >
                        Reveal Keys
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
