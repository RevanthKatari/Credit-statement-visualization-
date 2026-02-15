import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import db from '../models/database.js';
import { parseCSV } from '../services/csvParser.js';
import { generateInsights } from '../services/enrichment.js';

const router = Router();

// Configure multer
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are supported'));
    }
  }
});

// Upload statement
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Compute file hash to detect duplicates
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');

    // Check for duplicate
    const duplicate = db.prepare(
      'SELECT id FROM statements WHERE user_id = ? AND file_hash = ?'
    ).get(req.user.id, fileHash);

    if (duplicate) {
      fs.unlinkSync(req.file.path);
      return res.status(409).json({ error: 'This statement has already been uploaded' });
    }

    const statementId = uuidv4();

    // Parse CSV
    const { transactions, errors, totalRows } = parseCSV(fileContent, req.user.id, statementId);

    if (transactions.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'No valid transactions found in file',
        parsing_errors: errors
      });
    }

    // Save statement record
    db.prepare(`
      INSERT INTO statements (id, user_id, filename, original_name, file_type, file_hash, row_count, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')
    `).run(statementId, req.user.id, req.file.filename, req.file.originalname, 'csv', fileHash, transactions.length);

    // Batch insert transactions
    const insertTxn = db.prepare(`
      INSERT INTO transactions (id, user_id, statement_id, transaction_date, description, merchant, amount, type, category, is_recurring, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((txns) => {
      for (const txn of txns) {
        insertTxn.run(
          txn.id, txn.user_id, txn.statement_id, txn.transaction_date,
          txn.description, txn.merchant, txn.amount, txn.type,
          txn.category, txn.is_recurring, txn.raw_data
        );
      }
    });

    insertMany(transactions);

    // Generate insights
    const insights = generateInsights(req.user.id);

    res.status(201).json({
      statement: {
        id: statementId,
        filename: req.file.originalname,
        transactions_imported: transactions.length,
        total_rows: totalRows,
        parsing_errors: errors.length
      },
      insights_generated: insights.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', err);
    res.status(400).json({ error: err.message });
  }
});

// List statements
router.get('/', authenticate, (req, res) => {
  const statements = db.prepare(`
    SELECT id, filename, original_name, file_type, row_count, uploaded_at, status
    FROM statements
    WHERE user_id = ?
    ORDER BY uploaded_at DESC
  `).all(req.user.id);

  res.json({ statements });
});

// Delete statement and its transactions
router.delete('/:id', authenticate, (req, res) => {
  const statement = db.prepare(
    'SELECT * FROM statements WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!statement) {
    return res.status(404).json({ error: 'Statement not found' });
  }

  db.prepare('DELETE FROM transactions WHERE statement_id = ?').run(req.params.id);
  db.prepare('DELETE FROM statements WHERE id = ?').run(req.params.id);

  // Re-generate insights
  generateInsights(req.user.id);

  // Remove file
  const filePath = path.join(uploadDir, statement.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  res.json({ message: 'Statement and associated transactions deleted' });
});

export default router;
