import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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

    try {
      const response = await authAPI.login(formData);
      login(response.data.user, response.data.token);
      
      // Redirect based on role
      navigate(`/${response.data.user.role}/dashboard`);
    } catch (err) {
      // If our API wrapper marked it as a network error, show a friendly message
      if (err.isNetworkError) {
        setError('Unable to reach server. Please start the backend and try again.');
      } else {
        const status = err.response?.status;
        const data = err.response?.data;
        setError(
          data?.error
            ? `${data.error}${status ? ` (status ${status})` : ''}`
            : err.message || 'Login failed'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login to Your Account</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
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
          
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
        
        <div className="demo-accounts">
          <h4>Demo Accounts:</h4>
          <p><strong>Admin:</strong> admin@roxiler.com / Admin@123</p>
          <p><strong>User:</strong> Create via signup or admin panel</p>
          <p><strong>Owner:</strong> Create via admin panel</p>
        </div>
      </div>
    </div>
  );
};

export default Login;