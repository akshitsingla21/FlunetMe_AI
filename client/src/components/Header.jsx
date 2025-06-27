import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { points } = useUserData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if we should show back button (add routes where back button should appear)
  const showBackButton = ['/speaking-practice', '/reading-practice'].includes(location.pathname);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {showBackButton && (
            <button 
              className="back-button-header" 
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              ←
            </button>
          )}
          <Link to="/" className="logo">FluentMe_AI</Link>
        </div>
        {user && (
          <>
            <span className="points-display header-points">Points: {points}</span>
            <button className="menu-button" onClick={toggleMenu} aria-label="Toggle menu">
              ☰
            </button>
            <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
              <div className="user-info">
                <span className="points-display">Points: {points}</span>
                <button onClick={handleLogout} className="nav-link">Logout</button>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Header; 