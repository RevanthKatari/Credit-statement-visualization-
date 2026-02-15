import db from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Detect recurring subscriptions by finding transactions with
 * similar descriptions appearing monthly within a consistent amount range
 */
export function detectRecurring(userId) {
  const transactions = db.prepare(`
    SELECT id, merchant, amount, transaction_date, category
    FROM transactions
    WHERE user_id = ? AND type = 'debit'
    ORDER BY merchant, transaction_date
  `).all(userId);

  // Group by merchant
  const byMerchant = {};
  for (const txn of transactions) {
    const key = txn.merchant.toLowerCase();
    if (!byMerchant[key]) byMerchant[key] = [];
    byMerchant[key].push(txn);
  }

  const recurring = [];
  const updateStmt = db.prepare('UPDATE transactions SET is_recurring = 1 WHERE id = ?');

  for (const [merchant, txns] of Object.entries(byMerchant)) {
    if (txns.length < 2) continue;

    // Check if amounts are consistent (within 10% variance)
    const amounts = txns.map(t => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const isConsistent = amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.10);

    if (isConsistent) {
      // Check if they appear roughly monthly
      const dates = txns.map(t => new Date(t.transaction_date)).sort((a, b) => a - b);
      const gaps = [];
      for (let i = 1; i < dates.length; i++) {
        const diffDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
        gaps.push(diffDays);
      }
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

      // Monthly = 25-35 day gaps on average
      if (avgGap >= 20 && avgGap <= 40) {
        for (const txn of txns) {
          updateStmt.run(txn.id);
        }
        recurring.push({
          merchant: txns[0].merchant,
          amount: Math.round(avgAmount * 100) / 100,
          frequency: 'monthly',
          category: txns[0].category,
          count: txns.length
        });
      }
    }
  }

  return recurring;
}

/**
 * Generate insights based on user's transaction data
 */
export function generateInsights(userId) {
  // Clear old insights
  db.prepare('DELETE FROM insights WHERE user_id = ?').run(userId);

  const insights = [];
  const insertInsight = db.prepare(`
    INSERT INTO insights (id, user_id, type, title, description, severity, data, period)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. Monthly spending trend
  const monthlySpending = db.prepare(`
    SELECT
      strftime('%Y-%m', transaction_date) as month,
      SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_spent,
      SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits,
      COUNT(*) as txn_count
    FROM transactions
    WHERE user_id = ?
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `).all(userId);

  if (monthlySpending.length >= 2) {
    const current = monthlySpending[0];
    const previous = monthlySpending[1];
    const change = ((current.total_spent - previous.total_spent) / previous.total_spent * 100);

    if (Math.abs(change) > 20) {
      const direction = change > 0 ? 'increased' : 'decreased';
      const severity = change > 30 ? 'warning' : change < -10 ? 'positive' : 'info';

      const insight = {
        id: uuidv4(),
        type: 'spending_trend',
        title: `Spending ${direction} ${Math.abs(Math.round(change))}%`,
        description: `Your spending in ${current.month} was $${current.total_spent.toFixed(2)} compared to $${previous.total_spent.toFixed(2)} in ${previous.month}.`,
        severity,
        data: JSON.stringify({ current: current.total_spent, previous: previous.total_spent, change }),
        period: current.month
      };
      insights.push(insight);
      insertInsight.run(insight.id, userId, insight.type, insight.title, insight.description, insight.severity, insight.data, insight.period);
    }
  }

  // 2. Top spending category
  const categorySpending = db.prepare(`
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM transactions
    WHERE user_id = ? AND type = 'debit'
    GROUP BY category
    ORDER BY total DESC
    LIMIT 5
  `).all(userId);

  if (categorySpending.length > 0) {
    const top = categorySpending[0];
    const totalSpent = categorySpending.reduce((a, b) => a + b.total, 0);
    const pct = (top.total / totalSpent * 100).toFixed(0);

    const insight = {
      id: uuidv4(),
      type: 'top_category',
      title: `${pct}% of spending on ${top.category}`,
      description: `Your top spending category is ${top.category} with $${top.total.toFixed(2)} across ${top.count} transactions.`,
      severity: parseInt(pct) > 50 ? 'warning' : 'info',
      data: JSON.stringify(categorySpending),
      period: null
    };
    insights.push(insight);
    insertInsight.run(insight.id, userId, insight.type, insight.title, insight.description, insight.severity, insight.data, insight.period);
  }

  // 3. Recurring subscription total
  const recurring = detectRecurring(userId);
  if (recurring.length > 0) {
    const monthlySubTotal = recurring.reduce((a, b) => a + b.amount, 0);
    const yearlyEstimate = monthlySubTotal * 12;

    const insight = {
      id: uuidv4(),
      type: 'subscription_creep',
      title: `$${monthlySubTotal.toFixed(2)}/month in subscriptions`,
      description: `You have ${recurring.length} detected recurring charges totaling ~$${yearlyEstimate.toFixed(0)} per year.`,
      severity: monthlySubTotal > 200 ? 'warning' : 'info',
      data: JSON.stringify(recurring),
      period: null
    };
    insights.push(insight);
    insertInsight.run(insight.id, userId, insight.type, insight.title, insight.description, insight.severity, insight.data, insight.period);
  }

  // 4. Spending spike detection (single large transactions)
  const avgTransaction = db.prepare(`
    SELECT AVG(amount) as avg_amount, MAX(amount) as max_amount
    FROM transactions
    WHERE user_id = ? AND type = 'debit'
  `).get(userId);

  if (avgTransaction && avgTransaction.avg_amount) {
    const threshold = avgTransaction.avg_amount * 3;
    const spikes = db.prepare(`
      SELECT merchant, amount, transaction_date
      FROM transactions
      WHERE user_id = ? AND type = 'debit' AND amount > ?
      ORDER BY amount DESC
      LIMIT 5
    `).all(userId, threshold);

    if (spikes.length > 0) {
      const insight = {
        id: uuidv4(),
        type: 'spending_spikes',
        title: `${spikes.length} unusually large transaction${spikes.length > 1 ? 's' : ''}`,
        description: `Found transactions significantly above your average of $${avgTransaction.avg_amount.toFixed(2)}.`,
        severity: 'info',
        data: JSON.stringify(spikes),
        period: null
      };
      insights.push(insight);
      insertInsight.run(insight.id, userId, insight.type, insight.title, insight.description, insight.severity, insight.data, insight.period);
    }
  }

  // 5. Top merchants
  const topMerchants = db.prepare(`
    SELECT merchant, SUM(amount) as total, COUNT(*) as count
    FROM transactions
    WHERE user_id = ? AND type = 'debit'
    GROUP BY merchant
    ORDER BY total DESC
    LIMIT 5
  `).all(userId);

  if (topMerchants.length > 0) {
    const insight = {
      id: uuidv4(),
      type: 'top_merchants',
      title: `Most spent at ${topMerchants[0].merchant}`,
      description: `$${topMerchants[0].total.toFixed(2)} across ${topMerchants[0].count} transactions.`,
      severity: 'info',
      data: JSON.stringify(topMerchants),
      period: null
    };
    insights.push(insight);
    insertInsight.run(insight.id, userId, insight.type, insight.title, insight.description, insight.severity, insight.data, insight.period);
  }

  return insights;
}
