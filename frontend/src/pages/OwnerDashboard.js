import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../services/api';
import './Dashboard.css';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await ownerAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard"><p>Loading...</p></div>;
  if (error) return <div className="dashboard"><p className="error-message">{error}</p></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Owner Dashboard</h1>
        <p>Manage your store ratings</p>
      </div>

      <div className="dashboard-content">
        {dashboardData && (
          <>
            <div className="owner-stats">
              <div className="stat-card">
                <h3>Store Name</h3>
                <p className="stat-number">{dashboardData.store}</p>
              </div>
              <div className="stat-card">
                <h3>Average Rating</h3>
                <p className="stat-number">{dashboardData.average_rating} ⭐</p>
              </div>
              <div className="stat-card">
                <h3>Total Ratings</h3>
                <p className="stat-number">{dashboardData.rating_count}</p>
              </div>
            </div>

            <div className="raters-section">
              <h2>Recent Ratings</h2>
              {dashboardData.raters.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Rating</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.raters.map((rater, index) => (
                      <tr key={index}>
                        <td>{rater.name}</td>
                        <td>{rater.email}</td>
                        <td>
                          <span className="rating">
                            {rater.rating} ⭐
                          </span>
                        </td>
                        <td>{new Date(rater.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No ratings yet for your store.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;