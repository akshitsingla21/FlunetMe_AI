import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:3001/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial load

  useEffect(() => {
    // This effect runs once when the component mounts
    // to check if the user is already logged in.
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      // If we find a token and user data in storage,
      // we set it in our state.
      setUser(JSON.parse(userData));
    }
    setLoading(false); // Finished loading
  }, []);

  const register = async (username, password) => {
    // We send a POST request to our register endpoint.
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json(); // Return the server's response
  };

  const login = async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // If the server responds with an error (e.g., 401 Unauthorized),
      // we throw an error to be caught by the component.
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to login');
    }

    const data = await response.json();
    
    // On successful login, we get a token and user object.
    // 1. Store the token and user data in localStorage for persistence.
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // 2. Update the user state in our application.
    setUser(data.user);
  };

  const logout = () => {
    // To logout, we clear the user from our state and
    // remove their data from localStorage.
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // We expose the new register function and a loading state.
  // The loading state helps prevent a "flash" of the login page
  // if the user is already authenticated.
  const value = { user, loading, login, logout, register };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 