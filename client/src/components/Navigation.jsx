import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  Upload,
  Lightbulb,
  LogOut,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
];

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className="nav-bar"
    >
      <div className="nav-inner">
        <div className="nav-brand">
          <Sparkles size={18} strokeWidth={1.5} />
          <span>Lumina</span>
        </div>

        <div className="nav-links">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
            >
              <Icon size={16} strokeWidth={1.5} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="nav-user">
          <span className="nav-user-name">{user?.name}</span>
          <button onClick={handleLogout} className="nav-logout" title="Sign out">
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <style>{`
        .nav-bar {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: var(--space-md) var(--space-2xl);
          background: rgba(8, 9, 12, 0.7);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 1px solid var(--glass-border);
        }

        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-xl);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 1.1rem;
          letter-spacing: -0.03em;
        }

        .nav-brand svg {
          color: var(--accent);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 450;
          transition: all 0.25s var(--ease-out);
          text-decoration: none;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--glass-bg-hover);
        }

        .nav-link--active {
          color: var(--text-primary);
          background: var(--accent-subtle);
        }

        .nav-link--active svg {
          color: var(--accent);
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .nav-user-name {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 450;
        }

        .nav-logout {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: all 0.2s var(--ease-out);
        }

        .nav-logout:hover {
          color: var(--negative);
          background: var(--negative-subtle);
        }

        @media (max-width: 768px) {
          .nav-bar {
            padding: var(--space-sm) var(--space-md);
          }
          .nav-link span { display: none; }
          .nav-user-name { display: none; }
        }
      `}</style>
    </motion.nav>
  );
}
