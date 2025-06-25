import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { UserDataProvider } from './context/UserDataContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <UserDataProvider>
    <App />
      </UserDataProvider>
    </AuthProvider>
  </React.StrictMode>
);
