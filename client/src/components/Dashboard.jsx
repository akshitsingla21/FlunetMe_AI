import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMicrophone, FaBookOpen } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome to FluentMe_AI, {user.username}!</h2>
        <p>Your personal English learning coach. Practice speaking, reading, and track your progress as you become fluent, at your own pace!</p>
      </div>
      <div className="dashboard-menu">
        <Link to="/speaking-practice" className="dashboard-item">
          <FaMicrophone className="dashboard-icon" />
          <div className="dashboard-item-text">
            <h3>Speaking Practice</h3>
            <p>Improve your pronunciation and fluency.</p>
          </div>
        </Link>
        <Link to="/reading-practice" className="dashboard-item">
          <FaBookOpen className="dashboard-icon" />
          <div className="dashboard-item-text">
            <h3>Reading Practice</h3>
            <p>Improve your reading comprehension.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 