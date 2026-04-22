import React, { useState } from 'react';
import './index.css';
import Login    from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

/**
 * App — Root component
 * Manages authentication state across Register → Login → Dashboard
 * JWT token is persisted in localStorage (Part C)
 */
function App() {
  // ── Restore session from localStorage ─────────────────────────────────────
  const savedUser  = localStorage.getItem('user');
  const savedToken = localStorage.getItem('token');

  const [user, setUser]     = useState(savedUser && savedToken ? JSON.parse(savedUser) : null);
  const [page, setPage]     = useState('login'); // 'login' | 'register'

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('login');
  };

  // ── Routing ────────────────────────────────────────────────────────────────
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (page === 'register') {
    return (
      <Register
        onLogin={handleLogin}
        goToLogin={() => setPage('login')}
      />
    );
  }

  return (
    <Login
      onLogin={handleLogin}
      goToRegister={() => setPage('register')}
    />
  );
}

export default App;
