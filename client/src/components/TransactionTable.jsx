import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '../utils/format';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

const CATEGORY_COLORS = {
  dining: '#ff6b6b', groceries: '#4ecdc4', transport: '#45b7d1',
  shopping: '#96ceb4', subscriptions: '#a78bfa', utilities: '#f9ca24',
  health: '#ff8a80', entertainment: '#69db7c', travel: '#74b9ff',
  education: '#fd79a8', insurance: '#fdcb6e', transfers: '#81ecec',
  uncategorized: '#636e72',
};

export default function TransactionTable({
  transactions = [],
  loading,
  pagination,
  onPageChange,
  onSearch,
  onSort,
  sort = 'date_desc',
}) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const toggleSort = (field) => {
    const currentDir = sort.endsWith('_desc') ? 'desc' : 'asc';
    const currentField = sort.replace(/_(?:asc|desc)$/, '');
    const newDir = currentField === field && currentDir === 'desc' ? 'asc' : 'desc';
    onSort?.(`${field}_${newDir}`);
  };

  const SortIcon = ({ field }) => {
    const currentField = sort.replace(/_(?:asc|desc)$/, '');
    const isActive = currentField === field;
    const isDesc = sort.endsWith('_desc');
    if (!isActive) return <ChevronDown size={12} style={{ opacity: 0.2 }} />;
    return isDesc ? <ChevronDown size={12} /> : <ChevronUp size={12} />;
  };

  return (
    <div className="txn-table-wrapper">
      <div className="txn-search">
        <Search size={14} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchValue}
          onChange={handleSearch}
          className="txn-search-input"
        />
      </div>

      <div className="txn-table-scroll">
        <table className="txn-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('date')} className="txn-th-sortable">
                Date <SortIcon field="date" />
              </th>
              <th>Description</th>
              <th>Category</th>
              <th onClick={() => toggleSort('amount')} className="txn-th-sortable txn-th-right">
                Amount <SortIcon field="amount" />
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <motion.tr
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="txn-row-skeleton"
                  >
                    <td><div className="txn-skeleton-cell" style={{ width: '80px' }} /></td>
                    <td><div className="txn-skeleton-cell" style={{ width: '200px' }} /></td>
                    <td><div className="txn-skeleton-cell" style={{ width: '80px' }} /></td>
                    <td><div className="txn-skeleton-cell" style={{ width: '60px', marginLeft: 'auto' }} /></td>
                  </motion.tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="txn-empty">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((txn, i) => (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                      delay: i * 0.02,
                    }}
                    className="txn-row"
                  >
                    <td className="txn-date">{formatDate(txn.transaction_date)}</td>
                    <td className="txn-desc">
                      <span className="txn-merchant">{txn.merchant}</span>
                      {txn.is_recurring === 1 && (
                        <span className="txn-recurring">recurring</span>
                      )}
                    </td>
                    <td>
                      <span
                        className="txn-category"
                        style={{
                          '--cat-color': CATEGORY_COLORS[txn.category] || CATEGORY_COLORS.uncategorized,
                        }}
                      >
                        {txn.category}
                      </span>
                    </td>
                    <td className={`txn-amount ${txn.type === 'credit' ? 'txn-amount--credit' : ''}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="txn-pagination">
          <span className="txn-pagination-info">
            Page {pagination.page} of {pagination.pages} · {pagination.total} transactions
          </span>
          <div className="txn-pagination-buttons">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="txn-page-btn"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="txn-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <style>{`
        .txn-table-wrapper {
          width: 100%;
        }

        .txn-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
          color: var(--text-tertiary);
          transition: border-color 0.2s;
        }

        .txn-search:focus-within {
          border-color: var(--accent);
        }

        .txn-search-input {
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 0.85rem;
          width: 100%;
        }

        .txn-search-input::placeholder {
          color: var(--text-tertiary);
        }

        .txn-table-scroll {
          overflow-x: auto;
        }

        .txn-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .txn-table thead th {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 10px 14px;
          text-align: left;
          border-bottom: 1px solid var(--glass-border);
          position: sticky;
          top: 0;
          background: var(--bg-deep);
          z-index: 1;
        }

        .txn-th-sortable {
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .txn-th-sortable:hover {
          color: var(--text-secondary);
        }

        .txn-th-right {
          justify-content: flex-end;
        }

        .txn-row td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.02);
          font-size: 0.85rem;
          vertical-align: middle;
        }

        .txn-row:hover td {
          background: var(--glass-bg);
        }

        .txn-date {
          color: var(--text-secondary);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .txn-desc {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .txn-merchant {
          color: var(--text-primary);
          font-weight: 450;
        }

        .txn-recurring {
          font-size: 0.65rem;
          color: var(--accent);
          background: var(--accent-subtle);
          padding: 1px 6px;
          border-radius: var(--radius-full);
          font-weight: 500;
        }

        .txn-category {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--cat-color);
          background: color-mix(in srgb, var(--cat-color) 10%, transparent);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          text-transform: capitalize;
        }

        .txn-amount {
          text-align: right;
          font-family: var(--font-mono);
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .txn-amount--credit {
          color: var(--positive);
        }

        .txn-empty {
          text-align: center;
          padding: var(--space-2xl) !important;
          color: var(--text-tertiary);
        }

        .txn-skeleton-cell {
          height: 12px;
          background: var(--glass-bg);
          border-radius: var(--radius-sm);
        }

        .txn-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) 0;
          margin-top: var(--space-sm);
        }

        .txn-pagination-info {
          font-size: 0.78rem;
          color: var(--text-tertiary);
        }

        .txn-pagination-buttons {
          display: flex;
          gap: var(--space-sm);
        }

        .txn-page-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          font-size: 0.8rem;
          padding: 6px 14px;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-family: var(--font-sans);
          transition: all 0.2s var(--ease-out);
        }

        .txn-page-btn:hover:not(:disabled) {
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-hover);
          color: var(--text-primary);
        }

        .txn-page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
