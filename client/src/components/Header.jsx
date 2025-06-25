import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { points, level } = useUserData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-title">
          <h1>FluentMe_AI</h1>
        </Link>
        <nav className="header-nav">
          {user ? (
            <>
              <div className="user-stats">
                <span>Level: {level}</span>
                <span>Points: {points}</span>
              </div>
              <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 