import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate(getDashboardPath())}>
          <h2>StoreRatings</h2>
        </div>
        
        {user && (
          <nav className="nav">
            <span className="user-info">
              Welcome, {user.name} ({user.role})
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;