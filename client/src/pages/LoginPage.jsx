import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="ambient-bg" />

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 25, delay: 0.1 }}
      >
        <motion.div
          className="auth-brand"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles size={22} strokeWidth={1.5} />
          <span>Lumina</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your financial dashboard</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="auth-form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {error}
            </motion.div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="auth-submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <ArrowRight size={16} />}
          </motion.button>
        </motion.form>

        <motion.p
          className="auth-switch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Don't have an account? <Link to="/register">Create one</Link>
        </motion.p>
      </motion.div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-xl);
          position: relative;
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
          background: var(--glass-bg);
          backdrop-filter: blur(32px) saturate(1.4);
          -webkit-backdrop-filter: blur(32px) saturate(1.4);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          position: relative;
          z-index: 1;
        }

        .auth-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--accent);
          font-weight: 600;
          font-size: 1.05rem;
          margin-bottom: var(--space-2xl);
          letter-spacing: -0.02em;
        }

        .auth-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: var(--space-xs);
          letter-spacing: -0.03em;
        }

        .auth-subtitle {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          margin-bottom: var(--space-xl);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .auth-error {
          background: var(--negative-subtle);
          color: var(--negative);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 0.82rem;
          overflow: hidden;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auth-field label {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .auth-field input {
          background: var(--bg-surface);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 11px 14px;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }

        .auth-field input:focus {
          border-color: var(--accent);
        }

        .auth-field input::placeholder {
          color: var(--text-tertiary);
        }

        .auth-password-wrapper {
          position: relative;
        }

        .auth-password-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 4px;
          display: flex;
          transition: color 0.2s;
        }

        .auth-password-toggle:hover {
          color: var(--text-secondary);
        }

        .auth-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          margin-top: var(--space-sm);
          transition: background 0.2s var(--ease-out);
        }

        .auth-submit:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-switch {
          text-align: center;
          margin-top: var(--space-xl);
          font-size: 0.85rem;
          color: var(--text-tertiary);
        }

        .auth-switch a {
          color: var(--accent);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
