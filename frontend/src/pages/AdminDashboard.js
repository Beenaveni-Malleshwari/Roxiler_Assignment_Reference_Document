import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardStats();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'stores') {
      loadStores();
    }
  }, [activeTab]);

  const loadDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStores();
      setStores(response.data);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <nav className="dashboard-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'stores' ? 'active' : ''}
            onClick={() => setActiveTab('stores')}
          >
            Stores
          </button>
          <button 
            className={activeTab === 'add-user' ? 'active' : ''}
            onClick={() => setActiveTab('add-user')}
          >
            Add User
          </button>
          <button 
            className={activeTab === 'add-store' ? 'active' : ''}
            onClick={() => setActiveTab('add-store')}
          >
            Add Store
          </button>
        </nav>
      </div>

      <div className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div className="stats-grid">
            {stats && (
              <>
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.usersCount}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Stores</h3>
                  <p className="stat-number">{stats.storesCount}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Ratings</h3>
                  <p className="stat-number">{stats.ratingsCount}</p>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-container">
            <h2>Users Management</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.address || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="table-container">
            <h2>Stores Management</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Owner</th>
                    <th>Avg Rating</th>
                    <th>Total Ratings</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(store => (
                    <tr key={store.id}>
                      <td>{store.name}</td>
                      <td>{store.email}</td>
                      <td>{store.address || 'N/A'}</td>
                      <td>{store.owner_name || 'N/A'}</td>
                      <td>
                        {store.average_rating ? (
                          <span className="rating">
                            {store.average_rating} ⭐
                          </span>
                        ) : (
                          'No ratings'
                        )}
                      </td>
                      <td>{store.rating_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'add-user' && (
          <AddUserForm onUserAdded={loadUsers} />
        )}

        {activeTab === 'add-store' && (
          <AddStoreForm onStoreAdded={loadStores} />
        )}
      </div>
    </div>
  );
};

const AddUserForm = ({ onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminAPI.addUser(formData);
      setSuccess('User created successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        address: ''
      });
      onUserAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New User</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name (20-60 characters):</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength="20"
            maxLength="60"
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="owner">Store Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Address (optional):</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            maxLength="400"
            rows="3"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating User...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

const AddStoreForm = ({ onStoreAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [ownersError, setOwnersError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    setOwnersLoading(true);
    setOwnersError('');
    try {
      const response = await adminAPI.getUsers({ role: 'owner' });
      setOwners(response.data || []);
      if (!response.data || response.data.length === 0) {
        setOwnersError('No store owners found. Create owner users first.');
      }
    } catch (error) {
      console.error('Error loading owners:', error);
      // Show friendly message in UI; if unauthorized, prompt to login
      if (error.response?.status === 401) {
        setOwnersError('Unauthorized. Please log in as an admin to see owners.');
      } else {
        setOwnersError('Failed to load owners. Check your network or backend.');
      }
      setOwners([]);
    } finally {
      setOwnersLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminAPI.addStore(formData);
      setSuccess('Store created successfully!');
      setFormData({
        name: '',
        email: '',
        address: '',
        owner_id: ''
      });
      onStoreAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Store</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Store Name (20-60 characters):</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength="20"
            maxLength="60"
          />
        </div>
        
        <div className="form-group">
          <label>Store Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Address (optional):</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            maxLength="400"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Owner:</label>
          {ownersLoading ? (
            <div>Loading owners...</div>
          ) : ownersError ? (
            <div className="error-message">{ownersError}</div>
          ) : (
            <select name="owner_id" value={formData.owner_id} onChange={handleChange} required>
              <option value="">Select Owner</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.name ? `${owner.name} (${owner.email})` : owner.email}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Store...' : 'Create Store'}
        </button>
      </form>
    </div>
  );
};

export default AdminDashboard;