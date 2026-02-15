import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  delay = 0,
  padding = 'var(--space-lg)',
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 30,
        delay,
      }}
      whileHover={hover ? {
        y: -2,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      } : undefined}
      className={`glass-card ${className}`}
      style={{ padding }}
      {...props}
    >
      {children}
      <style>{`
        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(24px) saturate(1.3);
          -webkit-backdrop-filter: blur(24px) saturate(1.3);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s var(--ease-out), background 0.3s var(--ease-out);
        }
        .glass-card:hover {
          border-color: var(--glass-border-hover);
          background: var(--glass-bg-hover);
        }
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }
      `}</style>
    </motion.div>
  );
}
