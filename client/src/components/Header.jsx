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
    setIsMenuOpen(false);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu on nav link click
  const handleNavClick = (to) => {
    setIsMenuOpen(false);
    if (to) navigate(to);
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
            <button className="menu-button" onClick={toggleMenu} aria-label="Toggle menu">
              ☰
            </button>
            <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              <span onClick={() => handleNavClick('/')} className="nav-link" style={{cursor:'pointer'}}>Dashboard</span>
              <span onClick={() => handleNavClick('/profile')} className="nav-link" style={{cursor:'pointer'}}>Profile</span>
              <span onClick={() => handleNavClick('/leaderboard')} className="nav-link" style={{cursor:'pointer'}}>Leaderboard</span>
              <div className="user-info">
                <span className="points-display">Points: {points}</span>
                <span onClick={handleLogout} className="nav-link" style={{cursor:'pointer'}}>Logout</span>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Header; 