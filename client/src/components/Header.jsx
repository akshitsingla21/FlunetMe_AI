import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { points } = useUserData();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">FluentMe_AI</Link>
        
        {user && (
          <>
            <button className="menu-button" onClick={toggleMenu}>
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