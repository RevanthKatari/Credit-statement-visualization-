import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';
import { formatCurrency, formatNumber } from '../utils/format';

export default function StatCard({ label, value, prefix = '', isCurrency = false, icon: Icon, trend, delay = 0 }) {
  const formatter = isCurrency
    ? (v) => formatCurrency(v)
    : (v) => prefix + formatNumber(Math.round(v));

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 28,
        delay,
      }}
      whileHover={{
        y: -3,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }}
    >
      <div className="stat-header">
        {Icon && (
          <div className="stat-icon">
            <Icon size={18} strokeWidth={1.5} />
          </div>
        )}
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">
        <AnimatedNumber value={value || 0} format={formatter} />
      </div>
      {trend !== undefined && trend !== null && (
        <motion.div
          className={`stat-trend ${trend >= 0 ? 'stat-trend--up' : 'stat-trend--down'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4, duration: 0.5 }}
        >
          {trend >= 0 ? '↑' : '↓'} {Math.abs(Math.round(trend))}% vs prev
        </motion.div>
      )}

      <style>{`
        .stat-card {
          background: var(--glass-bg);
          backdrop-filter: blur(24px) saturate(1.3);
          -webkit-backdrop-filter: blur(24px) saturate(1.3);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s var(--ease-out), background 0.3s var(--ease-out);
        }

        .stat-card:hover {
          border-color: var(--glass-border-hover);
          background: var(--glass-bg-hover);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .stat-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--accent-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .stat-trend {
          margin-top: var(--space-sm);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stat-trend--up {
          color: var(--negative);
        }

        .stat-trend--down {
          color: var(--positive);
        }
      `}</style>
    </motion.div>
  );
}
