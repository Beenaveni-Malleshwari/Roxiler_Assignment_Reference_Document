import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import './Dashboard.css';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async (search = '') => {
    setLoading(true);
    try {
      const response = await userAPI.getStores(search);
      setStores(response.data);
    } catch (error) {
      console.error('Error loading stores:', error);
      setMessage('Error loading stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadStores(searchTerm);
  };

  const handleRating = async (storeId, rating) => {
    try {
      await userAPI.submitRating({ store_id: storeId, rating });
      setMessage('Rating submitted successfully!');
      loadStores(searchTerm); // Reload stores to update ratings
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error submitting rating');
    }
  };

  const handleUpdateRating = async (storeId, rating) => {
    try {
      await userAPI.updateRating(storeId, rating);
      setMessage('Rating updated successfully!');
      loadStores(searchTerm);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating rating');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <p>Rate and review stores</p>
      </div>

      <div className="dashboard-content">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search stores by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
            <button type="button" onClick={() => {
              setSearchTerm('');
              loadStores();
            }}>
              Clear
            </button>
          </form>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading stores...</p>
        ) : (
          <div className="stores-grid">
            {stores.map(store => (
              <div key={store.id} className="store-card">
                <h3>{store.name}</h3>
                <p className="store-email">{store.email}</p>
                <p className="store-address">{store.address || 'No address provided'}</p>
                
                <div className="rating-section">
                  <div className="overall-rating">
                    Overall Rating: {store.overall_rating ? `${store.overall_rating} ⭐` : 'No ratings yet'}
                  </div>
                  
                  <div className="user-rating">
                    <label>Your Rating:</label>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          className={`star-btn ${store.user_rating === star ? 'active' : ''} ${store.user_rating ? 'has-rating' : ''}`}
                          onClick={() => {
                            if (store.user_rating === star) {
                              // Already selected, maybe update to same? Or do nothing
                              return;
                            } else if (store.user_rating) {
                              handleUpdateRating(store.id, star);
                            } else {
                              handleRating(store.id, star);
                            }
                          }}
                        >
                          {star} ⭐
                        </button>
                      ))}
                    </div>
                    {store.user_rating && (
                      <span className="current-rating">
                        Your current rating: {store.user_rating} ⭐
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {stores.length === 0 && !loading && (
          <p>No stores found. Try a different search term.</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;