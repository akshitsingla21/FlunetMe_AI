import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { badgeDefs } from '../data/badges';
import './ProfilePage.css';

const LEVEL_THRESHOLDS = {
  1: 100,
  2: 250,
  3: 500,
  4: 1000,
};

const ProfilePage = () => {
  const { user } = useAuth();
  const { scores, points, level, badges } = useUserData();

  const nextLevelPoints = LEVEL_THRESHOLDS[level] || points;
  const pointsToNextLevel = nextLevelPoints - points;
  const progressPercentage = (points / nextLevelPoints) * 100;

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="profile-page">
      <h2>{user.username}'s Profile</h2>
      
      <div className="profile-summary">
        <div className="summary-item">
          <span className="summary-label">Level</span>
          <span className="summary-value">{level}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Points</span>
          <span className="summary-value">{points}</span>
        </div>
      </div>

      <div className="progress-section">
        <h3>Progress to Next Level</h3>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <p>{pointsToNextLevel > 0 ? `${pointsToNextLevel} points to Level ${level + 1}` : "You've reached the max level!"}</p>
      </div>

      <div className="badges-section">
        <h3>Your Badges</h3>
        {badges.length > 0 ? (
          <div className="badges-grid">
            {badges.map(badgeId => {
              const badge = badgeDefs[badgeId];
              if (!badge) return null;
              const Icon = badge.icon;
              return (
                <div key={badge.id} className="badge-item" title={badge.description}>
                  <Icon className="badge-icon" />
                  <span className="badge-title">{badge.title}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No badges earned yet. Keep practicing!</p>
        )}
      </div>

      <div className="scores-section">
        <h3>Speaking Practice Scores</h3>
        {scores.speaking.length > 0 ? (
          <ul className="scores-list">
            {scores.speaking.map((item, index) => (
              <li key={index}>
                <span>Score: {item.score}%</span>
                <span className="score-date">{formatDate(item.date)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No speaking scores yet. Go practice!</p>
        )}
      </div>

      <div className="scores-section">
        <h3>Reading Practice Scores</h3>
        {scores.reading.length > 0 ? (
          <ul className="scores-list">
            {scores.reading.map((item, index) => (
              <li key={index}>
                <span>Score: {item.score}%</span>
                <span className="score-date">{formatDate(item.date)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reading scores yet. Go practice!</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 