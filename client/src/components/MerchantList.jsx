import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/format';
import { Store } from 'lucide-react';

export default function MerchantList({ merchants = [], loading }) {
  if (loading) {
    return (
      <div className="merchant-skeleton">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="merchant-skeleton-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: i * 0.06 }}
          />
        ))}
        <style>{`
          .merchant-skeleton { display: flex; flex-direction: column; gap: 8px; }
          .merchant-skeleton-row { height: 48px; background: var(--glass-bg); border-radius: var(--radius-sm); }
        `}</style>
      </div>
    );
  }

  const maxAmount = merchants[0]?.total || 1;

  return (
    <div className="merchant-list">
      {merchants.map((m, i) => (
        <motion.div
          key={m.merchant}
          className="merchant-row"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 28,
            delay: i * 0.05,
          }}
        >
          <div className="merchant-rank">{i + 1}</div>
          <div className="merchant-icon">
            <Store size={14} strokeWidth={1.5} />
          </div>
          <div className="merchant-info">
            <span className="merchant-name">{m.merchant}</span>
            <span className="merchant-count">{m.count} transaction{m.count !== 1 ? 's' : ''}</span>
          </div>
          <div className="merchant-amount">
            <span className="merchant-total">{formatCurrency(m.total)}</span>
            <motion.div
              className="merchant-bar"
              initial={{ width: 0 }}
              animate={{ width: `${(m.total / maxAmount) * 100}%` }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 25,
                delay: 0.3 + i * 0.05,
              }}
            />
          </div>
        </motion.div>
      ))}

      <style>{`
        .merchant-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .merchant-row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: 10px 12px;
          border-radius: var(--radius-md);
          transition: background 0.2s var(--ease-out);
        }

        .merchant-row:hover {
          background: var(--glass-bg-hover);
        }

        .merchant-rank {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
          width: 18px;
          text-align: center;
        }

        .merchant-icon {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: var(--glass-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .merchant-info {
          flex: 1;
          min-width: 0;
        }

        .merchant-name {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .merchant-count {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        .merchant-amount {
          text-align: right;
          min-width: 100px;
        }

        .merchant-total {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--font-mono);
          display: block;
        }

        .merchant-bar {
          height: 2px;
          background: var(--accent);
          border-radius: var(--radius-full);
          margin-top: 4px;
          opacity: 0.4;
        }
      `}</style>
    </div>
  );
}
