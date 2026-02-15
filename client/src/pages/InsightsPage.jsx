import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import InsightCard from '../components/InsightCard';
import GlassCard from '../components/GlassCard';
import { formatCurrency } from '../utils/format';
import { Repeat, Lightbulb } from 'lucide-react';

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [recurring, setRecurring] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [insData, recData] = await Promise.all([
        api.getInsights(),
        api.getRecurring(),
      ]);
      setInsights(insData.insights);
      setRecurring(recData);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="insights-page">
      <div className="ambient-bg" />

      <motion.section
        className="insights-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 28 }}
      >
        <h1 className="insights-headline">Insights</h1>
        <p className="insights-subtitle">
          Patterns, alerts, and observations from your spending data
        </p>
      </motion.section>

      {/* Insights Grid */}
      {insights.length > 0 ? (
        <section className="insights-grid">
          {insights.map((insight, i) => (
            <InsightCard key={insight.id} insight={insight} index={i} />
          ))}
        </section>
      ) : !loading ? (
        <GlassCard delay={0.2} padding="var(--space-3xl)">
          <div className="insights-empty">
            <Lightbulb size={32} strokeWidth={1} />
            <h3>No insights yet</h3>
            <p>Upload a credit card statement to generate spending insights</p>
          </div>
        </GlassCard>
      ) : null}

      {/* Recurring Subscriptions */}
      {recurring && recurring.subscriptions.length > 0 && (
        <motion.section
          className="insights-recurring"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 28 }}
        >
          <div className="insights-recurring-header">
            <div>
              <h2>Recurring Charges</h2>
              <p>Detected subscriptions and repeating payments</p>
            </div>
            <div className="insights-recurring-totals">
              <div className="insights-recurring-stat">
                <span className="insights-recurring-value">
                  {formatCurrency(recurring.monthly_total)}
                </span>
                <span className="insights-recurring-label">/ month</span>
              </div>
              <div className="insights-recurring-stat">
                <span className="insights-recurring-value">
                  {formatCurrency(recurring.yearly_estimate)}
                </span>
                <span className="insights-recurring-label">/ year</span>
              </div>
            </div>
          </div>

          <div className="insights-recurring-grid">
            {recurring.subscriptions.map((sub, i) => (
              <motion.div
                key={sub.merchant}
                className="insights-sub-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 28,
                  delay: 0.5 + i * 0.05,
                }}
                whileHover={{ y: -2 }}
              >
                <div className="insights-sub-icon">
                  <Repeat size={14} strokeWidth={1.5} />
                </div>
                <div className="insights-sub-info">
                  <span className="insights-sub-name">{sub.merchant}</span>
                  <span className="insights-sub-meta">
                    {sub.occurrences} charges · {sub.category}
                  </span>
                </div>
                <span className="insights-sub-amount">
                  {formatCurrency(sub.avg_amount)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      <style>{`
        .insights-page {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 var(--space-2xl) var(--space-4xl);
        }

        .insights-hero {
          padding: var(--space-3xl) 0 var(--space-xl);
        }

        .insights-headline {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          margin-bottom: var(--space-xs);
        }

        .insights-subtitle {
          font-size: 0.9rem;
          color: var(--text-tertiary);
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-3xl);
        }

        .insights-empty {
          text-align: center;
          color: var(--text-tertiary);
        }

        .insights-empty svg {
          margin-bottom: var(--space-md);
          color: var(--accent);
        }

        .insights-empty h3 {
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        }

        .insights-recurring {
          margin-top: var(--space-xl);
        }

        .insights-recurring-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-xl);
          flex-wrap: wrap;
          gap: var(--space-md);
        }

        .insights-recurring-header h2 {
          font-size: 1.3rem;
          letter-spacing: -0.02em;
        }

        .insights-recurring-header p {
          font-size: 0.85rem;
          color: var(--text-tertiary);
        }

        .insights-recurring-totals {
          display: flex;
          gap: var(--space-xl);
        }

        .insights-recurring-stat {
          text-align: right;
        }

        .insights-recurring-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: var(--font-mono);
          letter-spacing: -0.02em;
        }

        .insights-recurring-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-left: 4px;
        }

        .insights-recurring-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-sm);
        }

        .insights-sub-card {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: 14px var(--space-md);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          transition: border-color 0.2s var(--ease-out), background 0.2s var(--ease-out);
        }

        .insights-sub-card:hover {
          border-color: var(--glass-border-hover);
          background: var(--glass-bg-hover);
        }

        .insights-sub-icon {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          background: var(--accent-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }

        .insights-sub-info {
          flex: 1;
          min-width: 0;
        }

        .insights-sub-name {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .insights-sub-meta {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          text-transform: capitalize;
        }

        .insights-sub-amount {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--font-mono);
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .insights-page { padding: 0 var(--space-md) var(--space-2xl); }
          .insights-headline { font-size: 1.5rem; }
          .insights-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
