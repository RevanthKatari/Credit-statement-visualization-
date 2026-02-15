import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle, Repeat, Zap, ShoppingBag } from 'lucide-react';

const SEVERITY_CONFIG = {
  info: {
    icon: Info,
    color: 'var(--accent)',
    bg: 'var(--accent-subtle)',
  },
  warning: {
    icon: AlertTriangle,
    color: 'var(--warning)',
    bg: 'var(--warning-subtle)',
  },
  alert: {
    icon: Zap,
    color: 'var(--negative)',
    bg: 'var(--negative-subtle)',
  },
  positive: {
    icon: CheckCircle,
    color: 'var(--positive)',
    bg: 'var(--positive-subtle)',
  },
};

const TYPE_ICON = {
  spending_trend: TrendingUp,
  top_category: ShoppingBag,
  subscription_creep: Repeat,
  spending_spikes: Zap,
  top_merchants: TrendingDown,
};

export default function InsightCard({ insight, index = 0 }) {
  const severity = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.info;
  const TypeIcon = TYPE_ICON[insight.type] || Info;

  return (
    <motion.div
      className="insight-card"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 26,
        delay: index * 0.08,
      }}
      whileHover={{
        y: -2,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
    >
      <div className="insight-icon-wrapper" style={{ background: severity.bg }}>
        <TypeIcon size={18} strokeWidth={1.5} style={{ color: severity.color }} />
      </div>
      <div className="insight-content">
        <h4 className="insight-title">{insight.title}</h4>
        <p className="insight-desc">{insight.description}</p>
        {insight.period && (
          <span className="insight-period">{insight.period}</span>
        )}
      </div>
      <div className="insight-severity-dot" style={{ background: severity.color }} />

      <style>{`
        .insight-card {
          background: var(--glass-bg);
          backdrop-filter: blur(24px) saturate(1.3);
          -webkit-backdrop-filter: blur(24px) saturate(1.3);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          display: flex;
          gap: var(--space-md);
          align-items: flex-start;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s var(--ease-out), background 0.3s var(--ease-out);
        }

        .insight-card:hover {
          border-color: var(--glass-border-hover);
          background: var(--glass-bg-hover);
        }

        .insight-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }

        .insight-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .insight-content {
          flex: 1;
          min-width: 0;
        }

        .insight-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }

        .insight-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .insight-period {
          display: inline-block;
          margin-top: 8px;
          font-size: 0.7rem;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
          background: var(--glass-bg);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .insight-severity-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
        }
      `}</style>
    </motion.div>
  );
}
