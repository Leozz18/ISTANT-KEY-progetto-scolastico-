import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import '../styles/admin.css';

export default function AdminDashboard({ auth }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (!auth?.user?.is_admin) {
    return (
      <>
        <Header auth={auth} />
        <main className="main-content">
          <div className="container">
            <div className="error-message">
              You don't have permission to access this page.
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header auth={auth} />

      <main className="main-content">
        <div className="container">
          <h1 className="page-title">Admin Dashboard</h1>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <div className="stats-grid admin-stats">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-value">{stats?.total_users}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Products</h3>
                  <p className="stat-value">{stats?.total_products}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Sales</h3>
                  <p className="stat-value">{stats?.total_sales}</p>
                </div>
                <div className="stat-card">
                  <h3>Revenue</h3>
                  <p className="stat-value">${stats?.revenue?.toFixed(2)}</p>
                </div>
              </div>

              <div className="admin-section">
                <h2>Recent Orders</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recent_orders?.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.user?.name || 'Unknown'}</td>
                        <td>${order.total_price}</td>
                        <td>{order.status}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
