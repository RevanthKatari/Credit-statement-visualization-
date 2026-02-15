import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import FileUpload from '../components/FileUpload';
import GlassCard from '../components/GlassCard';
import { formatDate } from '../utils/format';
import { FileText, Trash2 } from 'lucide-react';

export default function UploadPage() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatements();
  }, []);

  const loadStatements = async () => {
    try {
      const data = await api.getStatements();
      setStatements(data.statements);
    } catch (err) {
      console.error('Failed to load statements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this statement and all its transactions?')) return;
    try {
      await api.deleteStatement(id);
      setStatements(s => s.filter(st => st.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="upload-page">
      <div className="ambient-bg" />

      <motion.section
        className="upload-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 28 }}
      >
        <h1 className="upload-headline">Upload Statement</h1>
        <p className="upload-subtitle">
          Import a CSV credit card statement to analyze your spending
        </p>
      </motion.section>

      <div className="upload-layout">
        <div className="upload-main">
          <FileUpload onUploadComplete={loadStatements} />
        </div>

        <div className="upload-sidebar">
          <GlassCard delay={0.3} hover={false}>
            <h3 className="upload-sidebar-title">Previous Uploads</h3>
            <div className="upload-statements">
              <AnimatePresence>
                {statements.length === 0 && !loading ? (
                  <p className="upload-no-statements">No statements uploaded yet</p>
                ) : (
                  statements.map((st, i) => (
                    <motion.div
                      key={st.id}
                      className="upload-statement"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 28,
                        delay: i * 0.05,
                      }}
                    >
                      <FileText size={16} strokeWidth={1.5} className="upload-statement-icon" />
                      <div className="upload-statement-info">
                        <span className="upload-statement-name">{st.original_name}</span>
                        <span className="upload-statement-meta">
                          {st.row_count} rows · {formatDate(st.uploaded_at)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(st.id)}
                        className="upload-statement-delete"
                        title="Delete statement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>

      <style>{`
        .upload-page {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 var(--space-2xl) var(--space-4xl);
        }

        .upload-hero {
          padding: var(--space-3xl) 0 var(--space-xl);
        }

        .upload-headline {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          margin-bottom: var(--space-xs);
        }

        .upload-subtitle {
          font-size: 0.9rem;
          color: var(--text-tertiary);
        }

        .upload-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: var(--space-xl);
          align-items: start;
        }

        .upload-sidebar-title {
          font-size: 0.95rem;
          margin-bottom: var(--space-md);
        }

        .upload-statements {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .upload-no-statements {
          font-size: 0.82rem;
          color: var(--text-tertiary);
          text-align: center;
          padding: var(--space-lg) 0;
        }

        .upload-statement {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 10px 12px;
          border-radius: var(--radius-md);
          transition: background 0.2s;
        }

        .upload-statement:hover {
          background: var(--glass-bg-hover);
        }

        .upload-statement-icon {
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .upload-statement-info {
          flex: 1;
          min-width: 0;
        }

        .upload-statement-name {
          display: block;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .upload-statement-meta {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        .upload-statement-delete {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .upload-statement-delete:hover {
          color: var(--negative);
          background: var(--negative-subtle);
        }

        @media (max-width: 768px) {
          .upload-page { padding: 0 var(--space-md) var(--space-2xl); }
          .upload-layout { grid-template-columns: 1fr; }
          .upload-headline { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
