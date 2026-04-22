const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');

// Apply auth middleware to ALL expense routes
router.use(protect);

/**
 * POST /expense
 * Add a new expense for the authenticated user
 */
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ success: false, message: 'Title, amount, and category are required.' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount,
      category,
      date: date || Date.now(),
      notes,
    });

    res.status(201).json({ success: true, message: 'Expense added successfully!', expense });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error while adding expense.' });
  }
});

/**
 * GET /expenses
 * Get all expenses for the authenticated user
 * Supports optional ?category= filter
 */
router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    // Optional category filter (Part D bonus)
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    // Calculate total amount (Part D bonus)
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total: parseFloat(total.toFixed(2)),
      expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching expenses.' });
  }
});

/**
 * DELETE /expense/:id
 * Delete a specific expense (belongs to authenticated user)
 */
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    await expense.deleteOne();
    res.status(200).json({ success: true, message: 'Expense deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while deleting expense.' });
  }
});

module.exports = router;
