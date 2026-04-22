import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import '../styles/dashboard.css';

export default function Dashboard({ auth }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    lastOrder: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const orders = response.data.data;
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
      const lastOrder = orders[0];

      setStats({
        totalOrders: orders.length,
        totalSpent: totalSpent.toFixed(2),
        lastOrder,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  return (
    <>
      <Header auth={auth} />

      <main className="main-content">
        <div className="container">
          <h1 className="page-title">Dashboard</h1>

          <div className="welcome-section">
            <h2>Welcome back, {auth?.user?.name}!</h2>
            <p>Here's your account summary</p>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p className="stat-value">{stats.totalOrders}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Spent</h3>
                  <p className="stat-value">${stats.totalSpent}</p>
                </div>
                <div className="stat-card">
                  <h3>Account Status</h3>
                  <p className="stat-value">Active</p>
                </div>
              </div>

              <div className="action-buttons">
                <a href="/orders" className="btn-primary">
                  View Orders
                </a>
                <a href="/wishlist" className="btn-primary">
                  My Wishlist
                </a>
                <a href="/support" className="btn-primary">
                  Contact Support
                </a>
              </div>

              {stats.lastOrder && (
                <div className="last-order-section">
                  <h2>Last Order</h2>
                  <div className="order-summary">
                    <p><strong>Order ID:</strong> #{stats.lastOrder.id}</p>
                    <p><strong>Date:</strong> {new Date(stats.lastOrder.created_at).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> ${stats.lastOrder.total_price}</p>
                    <p><strong>Status:</strong> {stats.lastOrder.status}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
