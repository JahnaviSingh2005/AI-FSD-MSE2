import React, { useState, useEffect, useCallback } from 'react';
import { addExpense, getExpenses, deleteExpense } from '../api';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Healthcare', 'Entertainment', 'Education', 'Other'];

const CATEGORY_ICONS = {
  Food: '🍔', Travel: '✈️', Bills: '🧾', Shopping: '🛍️',
  Healthcare: '🏥', Entertainment: '🎬', Education: '📚', Other: '📦',
};

/**
 * Format a date string to a readable format
 */
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

/**
 * Dashboard Page — Part C
 * Shows expense list, add expense form, category filter, and total
 */
function Dashboard({ user, onLogout }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [expenses, setExpenses]           = useState([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [activeFilter, setActiveFilter]   = useState('All');
  const [formOpen, setFormOpen]           = useState(false);
  const [addError, setAddError]           = useState('');
  const [addSuccess, setAddSuccess]       = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [form, setForm] = useState({
    title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], notes: '',
  });

  // ── Fetch expenses (with optional category filter) ─────────────────────────
  const fetchExpenses = useCallback(async (category = 'All') => {
    setLoading(true);
    try {
      const data = await getExpenses(category);
      if (data.success) {
        setExpenses(data.expenses);
        setTotal(data.total);
      }
    } catch {
      // silently fail — keep old list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses(activeFilter);
  }, [activeFilter, fetchExpenses]);

  // ── Category filter handler ────────────────────────────────────────────────
  const handleFilter = (cat) => {
    setActiveFilter(cat);
  };

  // ── Add Expense Form ───────────────────────────────────────────────────────
  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    if (!form.title || !form.amount || !form.category) {
      return setAddError('Title, amount, and category are required.');
    }
    setSubmitting(true);
    try {
      const data = await addExpense({
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date || new Date().toISOString(),
        notes: form.notes,
      });
      if (data.success) {
        setAddSuccess('Expense added successfully! ✅');
        setForm({
          title: '', amount: '', category: 'Food',
          date: new Date().toISOString().split('T')[0], notes: '',
        });
        fetchExpenses(activeFilter);
        setTimeout(() => { setAddSuccess(''); setFormOpen(false); }, 1500);
      } else {
        setAddError(data.message || 'Failed to add expense.');
      }
    } catch {
      setAddError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Expense ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      const data = await deleteExpense(id);
      if (data.success) fetchExpenses(activeFilter);
    } catch {
      alert('Failed to delete expense.');
    }
  };

  // ── Derived Stats ──────────────────────────────────────────────────────────
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon">💰</div>
          Expense Manager
        </div>
        <div className="navbar-right">
          <div className="user-chip">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <span>{user.name}</span>
          </div>
          <button className="btn btn-ghost" id="logout-btn" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="main-content">

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">💸</div>
            <div className="stat-info">
              <h3>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
              <p>Total Expenses</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">📅</div>
            <div className="stat-info">
              <h3>₹{monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
              <p>This Month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber">🧾</div>
            <div className="stat-info">
              <h3>{expenses.length}</h3>
              <p>Transactions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">📊</div>
            <div className="stat-info">
              <h3>₹{expenses.length ? (total / expenses.length).toFixed(0) : 0}</h3>
              <p>Avg per Entry</p>
            </div>
          </div>
        </div>

        {/* ── Add Expense Section ─────────────────────────────────────────── */}
        <div className="add-expense-section">
          <div className="section-header">
            <h2 className="section-title">➕ Add New Expense</h2>
            <button
              className="btn btn-ghost"
              id="toggle-form-btn"
              onClick={() => { setFormOpen((o) => !o); setAddError(''); setAddSuccess(''); }}
            >
              {formOpen ? '✕ Cancel' : '+ Add'}
            </button>
          </div>

          {formOpen && (
            <form onSubmit={handleAddExpense} id="add-expense-form">
              {addError   && <div className="alert alert-error">⚠️ {addError}</div>}
              {addSuccess && <div className="alert alert-success">{addSuccess}</div>}

              <div className="expense-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="exp-title">Title</label>
                  <input
                    id="exp-title" name="title" type="text"
                    className="form-control" placeholder="e.g. Grocery Shopping"
                    value={form.title} onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exp-amount">Amount (₹)</label>
                  <input
                    id="exp-amount" name="amount" type="number" min="0.01" step="0.01"
                    className="form-control" placeholder="0.00"
                    value={form.amount} onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exp-category">Category</label>
                  <select
                    id="exp-category" name="category"
                    className="form-control"
                    value={form.category} onChange={handleFormChange}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exp-date">Date</label>
                  <input
                    id="exp-date" name="date" type="date"
                    className="form-control"
                    value={form.date} onChange={handleFormChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label" htmlFor="exp-notes">Notes (Optional)</label>
                  <input
                    id="exp-notes" name="notes" type="text"
                    className="form-control" placeholder="Any additional details…"
                    value={form.notes} onChange={handleFormChange}
                  />
                </div>
              </div>

              <button
                type="submit" id="add-expense-submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? '⏳ Saving…' : '💾 Save Expense'}
              </button>
            </form>
          )}
        </div>

        {/* ── Expense List Section ────────────────────────────────────────── */}
        <div className="expense-list-section">
          <div className="section-header">
            <h2 className="section-title">📋 Your Expenses</h2>
          </div>

          {/* Category Filter (Part D Bonus) */}
          <div className="filter-bar" role="group" aria-label="Category filter">
            {['All', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${activeFilter === cat ? 'active' : ''}`}
                id={`filter-${cat}`}
                onClick={() => handleFilter(cat)}
              >
                {cat !== 'All' && CATEGORY_ICONS[cat] + ' '}{cat}
              </button>
            ))}
          </div>

          {/* Expense Items */}
          {loading ? (
            <div className="spinner" />
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🪙</span>
              <h3>No expenses found</h3>
              <p>
                {activeFilter === 'All'
                  ? 'Start by adding your first expense above.'
                  : `No expenses in the "${activeFilter}" category.`}
              </p>
            </div>
          ) : (
            <div className="expense-list">
              {expenses.map((exp) => (
                <div className="expense-item" key={exp._id} id={`expense-${exp._id}`}>
                  <div className={`expense-cat-badge cat-${exp.category}`}>
                    {CATEGORY_ICONS[exp.category] || '📦'}
                  </div>
                  <div className="expense-info">
                    <h4>{exp.title}</h4>
                    <div className="expense-meta">
                      <span>{formatDate(exp.date)}</span>
                      <span
                        className={`cat-tag cat-${exp.category}`}
                        style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}
                      >
                        {exp.category}
                      </span>
                      {exp.notes && <span title={exp.notes}>📝</span>}
                    </div>
                  </div>
                  <div className="expense-amount">
                    ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <button
                    className="delete-btn"
                    id={`delete-${exp._id}`}
                    title="Delete expense"
                    onClick={() => handleDelete(exp._id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
