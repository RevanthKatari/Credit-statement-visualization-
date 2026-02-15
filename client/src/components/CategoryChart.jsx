import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatPercent } from '../utils/format';

export default function CategoryChart({ categories = [], total = 0, loading }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (loading) {
    return (
      <div className="cat-skeleton">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="cat-skeleton-row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.3, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="cat-skeleton-bar" style={{ width: `${80 - i * 12}%` }} />
          </motion.div>
        ))}
        <style>{`
          .cat-skeleton { display: flex; flex-direction: column; gap: 12px; padding: var(--space-md) 0; }
          .cat-skeleton-row { height: 36px; }
          .cat-skeleton-bar { height: 100%; background: var(--glass-bg); border-radius: var(--radius-sm); }
        `}</style>
      </div>
    );
  }

  // Take top 7 categories, group rest into "Other"
  const sorted = [...categories].sort((a, b) => b.total - a.total);
  const displayed = sorted.slice(0, 7);
  const maxValue = displayed[0]?.total || 1;

  return (
    <div className="cat-chart">
      {displayed.map((cat, i) => (
        <motion.div
          key={cat.category}
          className="cat-row"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 28,
            delay: i * 0.06,
          }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="cat-info">
            <span
              className="cat-dot"
              style={{ background: cat.color }}
            />
            <span className="cat-name">{cat.label}</span>
            <span className="cat-count">{cat.count} txn{cat.count !== 1 ? 's' : ''}</span>
          </div>
          <div className="cat-bar-wrapper">
            <motion.div
              className="cat-bar"
              initial={{ width: 0 }}
              animate={{ width: `${(cat.total / maxValue) * 100}%` }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 25,
                delay: 0.2 + i * 0.06,
              }}
              style={{
                background: cat.color,
                opacity: hoveredIndex === null || hoveredIndex === i ? 0.7 : 0.2,
              }}
            />
          </div>
          <div className="cat-values">
            <span className="cat-amount">{formatCurrency(cat.total)}</span>
            <span className="cat-pct">{formatPercent(cat.percentage)}</span>
          </div>
        </motion.div>
      ))}

      <style>{`
        .cat-chart {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cat-row {
          display: grid;
          grid-template-columns: 160px 1fr 100px;
          align-items: center;
          gap: var(--space-md);
          padding: 6px 0;
          cursor: default;
        }

        .cat-info {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .cat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .cat-name {
          font-size: 0.85rem;
          color: var(--text-primary);
          font-weight: 450;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cat-count {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          white-space: nowrap;
        }

        .cat-bar-wrapper {
          height: 6px;
          background: rgba(255,255,255,0.03);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .cat-bar {
          height: 100%;
          border-radius: var(--radius-full);
          transition: opacity 0.3s var(--ease-out);
        }

        .cat-values {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
        }

        .cat-amount {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--font-mono);
          letter-spacing: -0.02em;
        }

        .cat-pct {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        @media (max-width: 640px) {
          .cat-row {
            grid-template-columns: 120px 1fr 80px;
          }
          .cat-count { display: none; }
        }
      `}</style>
    </div>
  );
}
