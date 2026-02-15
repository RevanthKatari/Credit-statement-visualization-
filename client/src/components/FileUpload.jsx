import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader } from 'lucide-react';
import api from '../utils/api';

export default function FileUpload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSet(droppedFile);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) validateAndSet(selectedFile);
  };

  const validateAndSet = (f) => {
    setError(null);
    setResult(null);

    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported');
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB');
      return;
    }

    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const data = await api.uploadStatement(file);
      setResult(data);
      setFile(null);
      onUploadComplete?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="upload-wrapper">
      <AnimatePresence mode="wait">
        {!file && !result ? (
          <motion.div
            key="dropzone"
            className={`upload-zone ${isDragging ? 'upload-zone--active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            whileHover={{ scale: 1.005 }}
          >
            <motion.div
              className="upload-icon"
              animate={{
                y: isDragging ? -8 : 0,
                scale: isDragging ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Upload size={28} strokeWidth={1.2} />
            </motion.div>
            <h3 className="upload-title">Drop your statement here</h3>
            <p className="upload-subtitle">
              or click to browse · CSV files up to 10MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="upload-input-hidden"
            />
          </motion.div>
        ) : file && !result ? (
          <motion.div
            key="preview"
            className="upload-preview"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 200, damping: 28 }}
          >
            <div className="upload-file-info">
              <FileText size={24} strokeWidth={1.2} />
              <div>
                <span className="upload-filename">{file.name}</span>
                <span className="upload-filesize">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button onClick={reset} className="upload-remove">
                <X size={16} />
              </button>
            </div>
            <motion.button
              className="upload-btn"
              onClick={handleUpload}
              disabled={uploading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {uploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader size={16} />
                  </motion.div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload & Analyze
                </>
              )}
            </motion.button>
          </motion.div>
        ) : result ? (
          <motion.div
            key="success"
            className="upload-result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 28 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            >
              <CheckCircle size={40} strokeWidth={1.2} className="upload-success-icon" />
            </motion.div>
            <h3>Statement processed</h3>
            <div className="upload-stats">
              <div className="upload-stat">
                <span className="upload-stat-value">{result.statement?.transactions_imported}</span>
                <span className="upload-stat-label">transactions</span>
              </div>
              <div className="upload-stat">
                <span className="upload-stat-value">{result.insights_generated}</span>
                <span className="upload-stat-label">insights</span>
              </div>
            </div>
            <button onClick={reset} className="upload-btn upload-btn--secondary">
              Upload Another
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            className="upload-error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .upload-wrapper {
          width: 100%;
        }

        .upload-zone {
          border: 1px dashed var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--space-4xl) var(--space-2xl);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s var(--ease-out);
          background: var(--glass-bg);
        }

        .upload-zone:hover, .upload-zone--active {
          border-color: var(--accent);
          background: var(--accent-subtle);
        }

        .upload-icon {
          color: var(--text-tertiary);
          margin-bottom: var(--space-md);
          display: inline-block;
        }

        .upload-zone:hover .upload-icon,
        .upload-zone--active .upload-icon {
          color: var(--accent);
        }

        .upload-title {
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: var(--space-xs);
        }

        .upload-subtitle {
          font-size: 0.82rem;
          color: var(--text-tertiary);
        }

        .upload-input-hidden {
          display: none;
        }

        .upload-preview {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
        }

        .upload-file-info {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          color: var(--accent);
          margin-bottom: var(--space-lg);
        }

        .upload-filename {
          display: block;
          color: var(--text-primary);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .upload-filesize {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .upload-remove {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          transition: all 0.2s;
        }

        .upload-remove:hover {
          color: var(--negative);
          background: var(--negative-subtle);
        }

        .upload-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.2s var(--ease-out);
        }

        .upload-btn:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .upload-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .upload-btn--secondary {
          background: var(--glass-bg);
          color: var(--text-secondary);
          border: 1px solid var(--glass-border);
        }

        .upload-btn--secondary:hover {
          background: var(--glass-bg-hover) !important;
          border-color: var(--glass-border-hover);
        }

        .upload-result {
          text-align: center;
          padding: var(--space-2xl);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
        }

        .upload-success-icon {
          color: var(--positive);
          margin-bottom: var(--space-md);
        }

        .upload-result h3 {
          margin-bottom: var(--space-lg);
          color: var(--text-primary);
        }

        .upload-stats {
          display: flex;
          justify-content: center;
          gap: var(--space-2xl);
          margin-bottom: var(--space-xl);
        }

        .upload-stat {
          text-align: center;
        }

        .upload-stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: var(--font-mono);
        }

        .upload-stat-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .upload-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: var(--space-md);
          padding: 10px 14px;
          background: var(--negative-subtle);
          color: var(--negative);
          border-radius: var(--radius-md);
          font-size: 0.82rem;
        }
      `}</style>
    </div>
  );
}
