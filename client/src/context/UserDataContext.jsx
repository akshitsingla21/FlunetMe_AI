import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { checkBadges } from '../data/badges';

const UserDataContext = createContext(null);
const API_URL = 'http://localhost:3001/api/users';

const LEVEL_THRESHOLDS = {
  1: 100,
  2: 250,
  3: 500,
  4: 1000,
  // Add more levels as needed
};

export const UserDataProvider = ({ children }) => {
  const { user, token } = useAuth();

  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState([]);
  const [scores, setScores] = useState({ speaking: [], reading: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (user) {
      setPoints(user.points || 0);
      setLevel(user.level || 1);
      setBadges(user.badges || []);
    } else {
      setPoints(0);
      setLevel(1);
      setBadges([]);
      setScores({ speaking: [], reading: [] });
    }
    setLoading(false);
  }, [user]);

  const updateProgressOnServer = async (progressData) => {
    if (!user || !token) return;

    try {
      await fetch(`${API_URL}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...progressData
        }),
      });
    } catch (error) {
      console.error("Failed to update progress on server:", error);
    }
  };

  const addScore = (module, score) => {
    if (!user) return;

    const newPoints = points + score;
    let newLevel = level;

    if (LEVEL_THRESHOLDS[level] && newPoints >= LEVEL_THRESHOLDS[level]) {
      newLevel = level + 1;
    }
    
    const newScores = {
      ...scores,
      [module]: [...scores[module], { score, date: new Date() }]
    };

    const newBadges = checkBadges(newScores, newPoints, newLevel);

    setPoints(newPoints);
    setLevel(newLevel);
    setScores(newScores);
    setBadges(newBadges);

    updateProgressOnServer({ points: newPoints, level: newLevel, badges: newBadges });
  };

  const value = { scores, points, level, badges, addScore };

  return (
    <UserDataContext.Provider value={value}>
      {!loading && children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  return useContext(UserDataContext);
}; 