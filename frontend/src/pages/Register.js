import React, { useState } from 'react';
import { registerUser } from '../api';

/**
 * Register Page
 * Part C - Form handling for user registration
 * On success, stores JWT token and calls onLogin callback
 */
function Register({ onLogin, goToLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      return setError('Please fill in all fields.');
    }
    setLoading(true);
    try {
      const data = await registerUser(form.name, form.email, form.password);
      if (data.success) {
        // Store JWT token in localStorage (Part C)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || 'Registration failed.');
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
          <p>Create your free account</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
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
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            id="register-submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? '⏳ Creating Account…' : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account?{' '}
          <button onClick={goToLogin}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

export default Register;
