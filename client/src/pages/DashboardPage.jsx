import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import SpendingChart from '../components/SpendingChart';
import CategoryChart from '../components/CategoryChart';
import MerchantList from '../components/MerchantList';
import InsightCard from '../components/InsightCard';
import GlassCard from '../components/GlassCard';
import { staggerChild } from '../components/PageTransition';
import {
  DollarSign,
  CreditCard,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState({ categories: [], total: 0 });
  const [merchants, setMerchants] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [ov, mo, ca, me, ins] = await Promise.all([
        api.getOverview(),
        api.getMonthly(),
        api.getCategories(),
        api.getMerchants(8),
        api.getInsights(),
      ]);
      setOverview(ov);
      setMonthly(mo.monthly);
      setCategories(ca);
      setMerchants(me.merchants);
      setInsights(ins.insights);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasData = overview && overview.total_transactions > 0;

  return (
    <div className="dashboard">
      <div className="ambient-bg" />

      {/* Hero Section */}
      <motion.section className="dash-hero" variants={staggerChild}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 28 }}
        >
          <p className="dash-greeting">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </p>
          <h1 className="dash-headline">
            {hasData ? 'Your Financial Overview' : 'Welcome to Lumina'}
          </h1>
        </motion.div>
      </motion.section>

      {!hasData && !loading ? (
        <motion.section
          className="dash-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 28 }}
        >
          <GlassCard padding="var(--space-3xl) var(--space-2xl)">
            <div className="dash-empty-content">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="dash-empty-icon"
              >
                <BarChart3 size={40} strokeWidth={1} />
              </motion.div>
              <h2>Upload your first statement</h2>
              <p>
                Drop a CSV credit card statement to unlock spending insights,
                category breakdowns, and trend analysis.
              </p>
              <motion.button
                className="dash-empty-btn"
                onClick={() => navigate('/upload')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Upload Statement
                <ArrowUpRight size={16} />
              </motion.button>
            </div>
          </GlassCard>
        </motion.section>
      ) : (
        <>
          {/* Stats Grid */}
          <section className="dash-stats">
            <StatCard
              label="Total Spent"
              value={overview?.total_spent}
              isCurrency
              icon={DollarSign}
              delay={0.1}
            />
            <StatCard
              label="Transactions"
              value={overview?.total_transactions}
              icon={CreditCard}
              delay={0.15}
            />
            <StatCard
              label="Avg Transaction"
              value={overview?.avg_transaction}
              isCurrency
              icon={TrendingDown}
              delay={0.2}
            />
            <StatCard
              label="Credits"
              value={overview?.total_credits}
              isCurrency
              icon={BarChart3}
              delay={0.25}
            />
          </section>

          {/* Spending Trend */}
          <section className="dash-section">
            <GlassCard delay={0.3}>
              <div className="dash-section-header">
                <div>
                  <h2 className="dash-section-title">Spending Trend</h2>
                  <p className="dash-section-sub">Monthly spending over time</p>
                </div>
              </div>
              <SpendingChart data={monthly} loading={loading} />
            </GlassCard>
          </section>

          {/* Two Column: Categories + Merchants */}
          <section className="dash-two-col">
            <GlassCard delay={0.4}>
              <div className="dash-section-header">
                <div>
                  <h2 className="dash-section-title">By Category</h2>
                  <p className="dash-section-sub">Where your money goes</p>
                </div>
                <span className="dash-section-total">
                  {formatCurrency(categories.total, true)}
                </span>
              </div>
              <CategoryChart
                categories={categories.categories}
                total={categories.total}
                loading={loading}
              />
            </GlassCard>

            <GlassCard delay={0.5}>
              <div className="dash-section-header">
                <div>
                  <h2 className="dash-section-title">Top Merchants</h2>
                  <p className="dash-section-sub">Your most frequented</p>
                </div>
              </div>
              <MerchantList merchants={merchants} loading={loading} />
            </GlassCard>
          </section>

          {/* Insights */}
          {insights.length > 0 && (
            <section className="dash-section">
              <motion.div
                className="dash-section-header dash-section-header--standalone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div>
                  <h2 className="dash-section-title">Insights</h2>
                  <p className="dash-section-sub">Patterns we've noticed</p>
                </div>
              </motion.div>
              <div className="dash-insights-grid">
                {insights.slice(0, 4).map((insight, i) => (
                  <InsightCard key={insight.id} insight={insight} index={i} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <style>{`
        .dashboard {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 var(--space-2xl) var(--space-4xl);
        }

        .dash-hero {
          padding: var(--space-3xl) 0 var(--space-xl);
        }

        .dash-greeting {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          font-weight: 450;
          margin-bottom: var(--space-sm);
        }

        .dash-headline {
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.15;
        }

        .dash-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-2xl);
        }

        .dash-section {
          margin-bottom: var(--space-2xl);
        }

        .dash-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-lg);
        }

        .dash-section-header--standalone {
          padding: 0 var(--space-xs);
        }

        .dash-section-title {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }

        .dash-section-sub {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }

        .dash-section-total {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: var(--font-mono);
          letter-spacing: -0.03em;
        }

        .dash-two-col {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: var(--space-lg);
          margin-bottom: var(--space-2xl);
        }

        .dash-insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-md);
        }

        .dash-empty {
          max-width: 560px;
          margin: var(--space-xl) auto;
        }

        .dash-empty-content {
          text-align: center;
        }

        .dash-empty-icon {
          color: var(--accent);
          margin-bottom: var(--space-lg);
        }

        .dash-empty-content h2 {
          font-size: 1.3rem;
          margin-bottom: var(--space-sm);
        }

        .dash-empty-content p {
          font-size: 0.9rem;
          margin-bottom: var(--space-xl);
          max-width: 360px;
          margin-left: auto;
          margin-right: auto;
        }

        .dash-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.2s;
        }

        .dash-empty-btn:hover {
          background: var(--accent-hover);
        }

        @media (max-width: 900px) {
          .dash-two-col {
            grid-template-columns: 1fr;
          }
          .dashboard {
            padding: 0 var(--space-md) var(--space-2xl);
          }
          .dash-headline {
            font-size: 1.7rem;
          }
        }
      `}</style>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
