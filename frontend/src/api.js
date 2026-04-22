// ─── API Base URL ─────────────────────────────────────────────────────────────
// Uses REACT_APP_API_URL env var in production, falls back to localhost for dev
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Helper: return auth headers with Bearer token from localStorage
 */
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ─── Auth APIs ────────────────────────────────────────────────────────────────

/**
 * POST /register → Register a new user
 */
export const registerUser = async (name, email, password) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};

/**
 * POST /login → Authenticate user and receive JWT token
 */
export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// ─── Expense APIs (Protected) ─────────────────────────────────────────────────

/**
 * POST /expense → Add a new expense
 */
export const addExpense = async (expenseData) => {
  const res = await fetch(`${BASE_URL}/expense`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(expenseData),
  });
  return res.json();
};

/**
 * GET /expenses → Fetch all expenses for logged-in user (supports ?category= filter)
 */
export const getExpenses = async (category = 'All') => {
  const query = category && category !== 'All' ? `?category=${category}` : '';
  const res = await fetch(`${BASE_URL}/expenses${query}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return res.json();
};

/**
 * DELETE /expense/:id → Delete a specific expense
 */
export const deleteExpense = async (id) => {
  const res = await fetch(`${BASE_URL}/expense/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
};
