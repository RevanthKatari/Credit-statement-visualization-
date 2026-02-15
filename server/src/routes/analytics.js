import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../models/database.js';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/categories.js';

const router = Router();

// Dashboard overview
router.get('/overview', authenticate, (req, res) => {
  const userId = req.user.id;

  const totals = db.prepare(`
    SELECT
      SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_spent,
      SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits,
      COUNT(*) as total_transactions,
      AVG(CASE WHEN type = 'debit' THEN amount END) as avg_transaction
    FROM transactions WHERE user_id = ?
  `).get(userId);

  const statementCount = db.prepare(
    'SELECT COUNT(*) as count FROM statements WHERE user_id = ?'
  ).get(userId);

  const dateRange = db.prepare(`
    SELECT MIN(transaction_date) as earliest, MAX(transaction_date) as latest
    FROM transactions WHERE user_id = ?
  `).get(userId);

  res.json({
    total_spent: totals?.total_spent || 0,
    total_credits: totals?.total_credits || 0,
    total_transactions: totals?.total_transactions || 0,
    avg_transaction: Math.round((totals?.avg_transaction || 0) * 100) / 100,
    statement_count: statementCount?.count || 0,
    date_range: dateRange || { earliest: null, latest: null }
  });
});

// Monthly spending trends
router.get('/monthly', authenticate, (req, res) => {
  const userId = req.user.id;

  const monthly = db.prepare(`
    SELECT
      strftime('%Y-%m', transaction_date) as month,
      SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as spent,
      SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as credits,
      COUNT(*) as transactions
    FROM transactions
    WHERE user_id = ?
    GROUP BY month
    ORDER BY month ASC
  `).all(userId);

  res.json({ monthly });
});

// Category breakdown
router.get('/categories', authenticate, (req, res) => {
  const userId = req.user.id;
  const { month } = req.query;

  let query = `
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM transactions
    WHERE user_id = ? AND type = 'debit'
  `;
  const params = [userId];

  if (month) {
    query += ` AND strftime('%Y-%m', transaction_date) = ?`;
    params.push(month);
  }

  query += ' GROUP BY category ORDER BY total DESC';

  const categories = db.prepare(query).all(...params);

  const totalSpent = categories.reduce((a, b) => a + b.total, 0);

  const enriched = categories.map(cat => ({
    ...cat,
    percentage: totalSpent > 0 ? Math.round(cat.total / totalSpent * 1000) / 10 : 0,
    color: CATEGORY_COLORS[cat.category] || '#636E72',
    label: CATEGORY_LABELS[cat.category] || cat.category
  }));

  res.json({ categories: enriched, total: totalSpent });
});

// Top merchants
router.get('/merchants', authenticate, (req, res) => {
  const userId = req.user.id;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const merchants = db.prepare(`
    SELECT merchant, SUM(amount) as total, COUNT(*) as count, category
    FROM transactions
    WHERE user_id = ? AND type = 'debit'
    GROUP BY merchant
    ORDER BY total DESC
    LIMIT ?
  `).all(userId, limit);

  res.json({ merchants });
});

// Transactions list with filtering
router.get('/transactions', authenticate, (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 50, category, month, search, sort = 'date_desc' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
  const params = [userId];
  const countParams = [userId];

  if (category) {
    query += ' AND category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
    countParams.push(category);
  }

  if (month) {
    query += " AND strftime('%Y-%m', transaction_date) = ?";
    countQuery += " AND strftime('%Y-%m', transaction_date) = ?";
    params.push(month);
    countParams.push(month);
  }

  if (search) {
    query += ' AND (description LIKE ? OR merchant LIKE ?)';
    countQuery += ' AND (description LIKE ? OR merchant LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam);
    countParams.push(searchParam, searchParam);
  }

  // Sorting
  const sortMap = {
    date_desc: 'transaction_date DESC',
    date_asc: 'transaction_date ASC',
    amount_desc: 'amount DESC',
    amount_asc: 'amount ASC'
  };
  query += ` ORDER BY ${sortMap[sort] || 'transaction_date DESC'}`;
  query += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  const total = db.prepare(countQuery).get(...countParams);
  const transactions = db.prepare(query).all(...params);

  res.json({
    transactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total?.total || 0,
      pages: Math.ceil((total?.total || 0) / parseInt(limit))
    }
  });
});

// Insights
router.get('/insights', authenticate, (req, res) => {
  const insights = db.prepare(`
    SELECT * FROM insights
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(req.user.id);

  res.json({ insights });
});

// Recurring subscriptions
router.get('/recurring', authenticate, (req, res) => {
  const recurring = db.prepare(`
    SELECT merchant, AVG(amount) as avg_amount, COUNT(*) as occurrences, category,
           MIN(transaction_date) as first_seen, MAX(transaction_date) as last_seen
    FROM transactions
    WHERE user_id = ? AND is_recurring = 1 AND type = 'debit'
    GROUP BY merchant
    ORDER BY avg_amount DESC
  `).all(req.user.id);

  const monthlyTotal = recurring.reduce((a, b) => a + b.avg_amount, 0);

  res.json({
    subscriptions: recurring.map(r => ({
      ...r,
      avg_amount: Math.round(r.avg_amount * 100) / 100
    })),
    monthly_total: Math.round(monthlyTotal * 100) / 100,
    yearly_estimate: Math.round(monthlyTotal * 12 * 100) / 100
  });
});

// Daily spending for a given month
router.get('/daily', authenticate, (req, res) => {
  const userId = req.user.id;
  const { month } = req.query;

  let query = `
    SELECT
      transaction_date as date,
      SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as spent,
      COUNT(*) as transactions
    FROM transactions
    WHERE user_id = ?
  `;
  const params = [userId];

  if (month) {
    query += " AND strftime('%Y-%m', transaction_date) = ?";
    params.push(month);
  }

  query += ' GROUP BY transaction_date ORDER BY transaction_date ASC';

  const daily = db.prepare(query).all(...params);
  res.json({ daily });
});

export default router;
