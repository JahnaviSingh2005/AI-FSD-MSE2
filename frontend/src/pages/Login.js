import React, { useState } from 'react';
import { loginUser } from '../api';

/**
 * Login Page
 * Part C - Form handling for authentication
 * On success, stores JWT token and user info in localStorage
 */
function Login({ onLogin, goToRegister }) {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      return setError('Please enter your email and password.');
    }
    setLoading(true);
    try {
      const data = await loginUser(form.email, form.password);
      if (data.success) {
        // Store JWT token in localStorage (Part C)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch {
      setError('Network error. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo / Branding */}
        <div className="auth-logo">
          <div className="logo-icon">💰</div>
          <h1>Expense Manager</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-control"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            id="login-submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? '⏳ Signing In…' : '🔐 Sign In'}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account?{' '}
          <button onClick={goToRegister}>Create one</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
