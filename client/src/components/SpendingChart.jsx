import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatShortMonth } from '../utils/format';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{label}</span>
      {payload.map((entry, i) => (
        <div key={i} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: entry.color }} />
          <span>{entry.name}: {formatCurrency(entry.value)}</span>
        </div>
      ))}
      <style>{`
        .chart-tooltip {
          background: rgba(18, 20, 27, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          font-size: 0.8rem;
        }
        .chart-tooltip-label {
          color: var(--text-tertiary);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 6px;
        }
        .chart-tooltip-row {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-primary);
          font-weight: 500;
        }
        .chart-tooltip-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default function SpendingChart({ data = [], loading }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (data.length > 0) {
      const timer = setTimeout(() => setAnimate(true), 200);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const chartData = data.map(d => ({
    month: formatShortMonth(d.month),
    Spent: d.spent || 0,
    Credits: d.credits || 0,
  }));

  if (loading) {
    return (
      <motion.div
        className="chart-skeleton"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="chart-skeleton-bars">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="chart-skeleton-bar"
              initial={{ height: 0 }}
              animate={{ height: `${30 + Math.random() * 50}%` }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </div>
        <style>{`
          .chart-skeleton {
            height: 300px;
            display: flex;
            align-items: flex-end;
            padding: var(--space-lg);
          }
          .chart-skeleton-bars {
            display: flex;
            align-items: flex-end;
            gap: 12px;
            width: 100%;
            height: 100%;
          }
          .chart-skeleton-bar {
            flex: 1;
            background: var(--glass-bg);
            border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          }
        `}</style>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: animate ? 1 : 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', height: 300 }}
    >
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCredits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--positive)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="var(--positive)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="rgba(255,255,255,0.03)"
            strokeDasharray="3 6"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Spent"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#gradSpent)"
            animationDuration={1500}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="Credits"
            stroke="var(--positive)"
            strokeWidth={1.5}
            fill="url(#gradCredits)"
            animationDuration={1800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
