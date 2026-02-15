import { parse } from 'csv-parse/sync';
import { categorizeTransaction, extractMerchant } from '../utils/categories.js';
import { v4 as uuidv4 } from 'uuid';

// Common date formats to try
const DATE_PATTERNS = [
  /^(\d{4})-(\d{2})-(\d{2})$/,           // YYYY-MM-DD
  /^(\d{2})\/(\d{2})\/(\d{4})$/,           // MM/DD/YYYY
  /^(\d{2})-(\d{2})-(\d{4})$/,             // MM-DD-YYYY
  /^(\d{2})\/(\d{2})\/(\d{2})$/,           // MM/DD/YY
  /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,       // M/D/YYYY
];

function parseDate(dateStr) {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // Try ISO format first
  if (DATE_PATTERNS[0].test(trimmed)) return trimmed;

  // MM/DD/YYYY
  let m = trimmed.match(DATE_PATTERNS[1]) || trimmed.match(DATE_PATTERNS[4]);
  if (m) return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;

  // MM-DD-YYYY
  m = trimmed.match(DATE_PATTERNS[2]);
  if (m) return `${m[3]}-${m[1]}-${m[2]}`;

  // MM/DD/YY
  m = trimmed.match(DATE_PATTERNS[3]);
  if (m) {
    const year = parseInt(m[3]) > 50 ? `19${m[3]}` : `20${m[3]}`;
    return `${year}-${m[1]}-${m[2]}`;
  }

  // Last resort: try JS Date parsing
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

function parseAmount(amountStr) {
  if (typeof amountStr === 'number') return amountStr;
  if (!amountStr) return null;
  // Remove currency symbols, commas, spaces
  const cleaned = amountStr.toString().replace(/[$€£,\s]/g, '').trim();
  // Handle parentheses as negative
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    return -parseFloat(cleaned.slice(1, -1));
  }
  return parseFloat(cleaned);
}

// Map common column header variations
const COLUMN_MAPS = {
  date: ['date', 'transaction date', 'trans date', 'post date', 'posting date', 'txn date'],
  description: ['description', 'merchant', 'name', 'memo', 'details', 'transaction description', 'payee'],
  amount: ['amount', 'transaction amount', 'debit', 'charge'],
  credit: ['credit', 'payment', 'credit amount'],
  type: ['type', 'transaction type', 'trans type']
};

function findColumn(headers, candidates) {
  const normalized = headers.map(h => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const idx = normalized.indexOf(candidate);
    if (idx !== -1) return headers[idx];
  }
  return null;
}

export function parseCSV(content, userId, statementId) {
  let records;
  try {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true
    });
  } catch (err) {
    throw new Error(`CSV parsing failed: ${err.message}`);
  }

  if (!records || records.length === 0) {
    throw new Error('CSV file contains no data rows');
  }

  const headers = Object.keys(records[0]);
  const dateCol = findColumn(headers, COLUMN_MAPS.date);
  const descCol = findColumn(headers, COLUMN_MAPS.description);
  const amountCol = findColumn(headers, COLUMN_MAPS.amount);
  const creditCol = findColumn(headers, COLUMN_MAPS.credit);
  const typeCol = findColumn(headers, COLUMN_MAPS.type);

  if (!dateCol) throw new Error('Could not find a date column. Expected: ' + COLUMN_MAPS.date.join(', '));
  if (!descCol) throw new Error('Could not find a description column. Expected: ' + COLUMN_MAPS.description.join(', '));
  if (!amountCol && !creditCol) throw new Error('Could not find an amount column. Expected: ' + COLUMN_MAPS.amount.join(', '));

  const transactions = [];
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    try {
      const date = parseDate(row[dateCol]);
      if (!date) {
        errors.push(`Row ${i + 1}: Invalid date "${row[dateCol]}"`);
        continue;
      }

      const description = (row[descCol] || '').trim();
      if (!description) {
        errors.push(`Row ${i + 1}: Empty description`);
        continue;
      }

      let amount, type;

      if (amountCol && creditCol) {
        // Separate debit/credit columns
        const debitAmt = parseAmount(row[amountCol]);
        const creditAmt = parseAmount(row[creditCol]);
        if (creditAmt && !isNaN(creditAmt) && creditAmt > 0) {
          amount = creditAmt;
          type = 'credit';
        } else if (debitAmt && !isNaN(debitAmt)) {
          amount = Math.abs(debitAmt);
          type = 'debit';
        } else {
          errors.push(`Row ${i + 1}: Invalid amount`);
          continue;
        }
      } else {
        amount = parseAmount(row[amountCol]);
        if (amount === null || isNaN(amount)) {
          errors.push(`Row ${i + 1}: Invalid amount "${row[amountCol]}"`);
          continue;
        }

        if (typeCol && row[typeCol]) {
          type = row[typeCol].toLowerCase().includes('credit') ? 'credit' : 'debit';
        } else {
          type = amount < 0 ? 'credit' : 'debit';
        }
        amount = Math.abs(amount);
      }

      const merchant = extractMerchant(description);
      const category = categorizeTransaction(description);

      transactions.push({
        id: uuidv4(),
        user_id: userId,
        statement_id: statementId,
        transaction_date: date,
        description,
        merchant,
        amount: Math.round(amount * 100) / 100,
        type,
        category,
        is_recurring: 0,
        raw_data: JSON.stringify(row)
      });
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  return { transactions, errors, totalRows: records.length };
}
