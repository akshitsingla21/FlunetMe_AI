import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LeaderboardPage.css';

const API_URL = import.meta.env.VITE_API_URL + '/leaderboard';

const medals = ['🥇', '🥈', '🥉'];

const getInitial = (username) => username ? username.charAt(0).toUpperCase() : '?';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    // Only fetch rank if user is logged in and not in the top 10
    if (user && leaderboard.length > 0) {
      const inTop = leaderboard.some(entry => entry.username === user.username);
      if (!inTop) {
        fetch(`${API_URL}/rank/${user.id}`)
          .then(res => res.json())
          .then(data => setUserRank(data))
          .catch(err => console.error('Failed to fetch user rank:', err));
      } else {
        setUserRank(null);
      }
    }
  }, [user, leaderboard]);

  return (
    <div className="leaderboard-page">
      <h2>Leaderboard</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Points</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length === 0 ? (
            <tr><td colSpan="4">No users yet!</td></tr>
          ) : (
            leaderboard.map((entry, idx) => (
              <tr
                key={entry._id}
                className={user && entry.username === user.username ? 'current-user' : ''}
              >
                <td>
                  {idx < 3 ? (
                    <span className="medal">{medals[idx]}</span>
                  ) : (
                    idx + 1
                  )}
                </td>
                <td style={{ textAlign: 'left' }}>
                  <span className="avatar">{getInitial(entry.username)}</span>
                  {entry.username}
                </td>
                <td>{entry.points}</td>
                <td>{entry.level}</td>
              </tr>
            ))
          )}
          {/* Show current user's rank if not in top 10 */}
          {user && userRank && (
            <tr className="current-user">
              <td>{userRank.rank}</td>
              <td style={{ textAlign: 'left' }}>
                <span className="avatar">{getInitial(userRank.username)}</span>
                {userRank.username} (You)
              </td>
              <td>{userRank.points}</td>
              <td>{userRank.level}</td>
            </tr>
          )}
        </tbody>
      </table>
      {user && userRank && (
        <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--primary-color, #1976d2)', fontWeight: 500 }}>
          Your global rank: <span style={{ fontSize: '1.2em' }}>{userRank.rank}</span>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage; 