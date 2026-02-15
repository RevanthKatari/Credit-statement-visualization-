import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import TransactionTable from '../components/TransactionTable';
import GlassCard from '../components/GlassCard';
import { Receipt } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('date_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30, sort };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;

      const data = await api.getTransactions(params);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, searchTerm, selectedCategory]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState(null);
  const handleSearch = (value) => {
    if (searchDebounce) clearTimeout(searchDebounce);
    const timeout = setTimeout(() => {
      setSearchTerm(value);
      setPage(1);
    }, 400);
    setSearchDebounce(timeout);
  };

  const handleSort = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const categories = [
    '', 'dining', 'groceries', 'transport', 'shopping', 'subscriptions',
    'utilities', 'health', 'entertainment', 'travel', 'education',
    'insurance', 'transfers', 'uncategorized'
  ];

  return (
    <div className="txn-page">
      <div className="ambient-bg" />

      <motion.section
        className="txn-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 28 }}
      >
        <h1 className="txn-headline">Transactions</h1>
        <p className="txn-subtitle">Every charge, categorized and searchable</p>
      </motion.section>

      {/* Category Filter Pills */}
      <motion.div
        className="txn-filters"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {categories.map((cat) => (
          <button
            key={cat || 'all'}
            className={`txn-filter-pill ${selectedCategory === cat ? 'txn-filter-pill--active' : ''}`}
            onClick={() => { setSelectedCategory(cat); setPage(1); }}
          >
            {cat || 'All'}
          </button>
        ))}
      </motion.div>

      <GlassCard delay={0.2} hover={false} padding="var(--space-lg)">
        <TransactionTable
          transactions={transactions}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onSearch={handleSearch}
          onSort={handleSort}
          sort={sort}
        />
      </GlassCard>

      <style>{`
        .txn-page {
          position: relative;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 var(--space-2xl) var(--space-4xl);
        }

        .txn-hero {
          padding: var(--space-3xl) 0 var(--space-lg);
        }

        .txn-headline {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          margin-bottom: var(--space-xs);
        }

        .txn-subtitle {
          font-size: 0.9rem;
          color: var(--text-tertiary);
        }

        .txn-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-sm);
        }

        .txn-filter-pill {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          padding: 5px 14px;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 450;
          font-family: var(--font-sans);
          cursor: pointer;
          text-transform: capitalize;
          transition: all 0.2s var(--ease-out);
        }

        .txn-filter-pill:hover {
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-hover);
          color: var(--text-primary);
        }

        .txn-filter-pill--active {
          background: var(--accent-subtle);
          border-color: var(--accent);
          color: var(--accent);
        }

        @media (max-width: 768px) {
          .txn-page { padding: 0 var(--space-md) var(--space-2xl); }
          .txn-headline { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
