/**
 * Seed script — generates a demo user with realistic transaction data
 * Run: node src/seed.js
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './models/database.js';
import { categorizeTransaction, extractMerchant } from './utils/categories.js';
import { generateInsights } from './services/enrichment.js';

const DEMO_USER = {
  email: 'demo@lumina.app',
  password: 'demo1234',
  name: 'Alex Chen',
};

// Realistic transaction templates
const TRANSACTIONS = [
  // Dining
  { desc: 'STARBUCKS #12847', min: 4, max: 8 },
  { desc: 'CHIPOTLE MEXICAN GRILL', min: 9, max: 16 },
  { desc: 'UBER EATS *BURGER KING', min: 12, max: 22 },
  { desc: 'DOORDASH *SUSHI PALACE', min: 18, max: 35 },
  { desc: 'THE COFFEE BEAN & TEA', min: 5, max: 9 },
  { desc: 'PANERA BREAD #2031', min: 10, max: 16 },
  { desc: 'DUNKIN DONUTS', min: 3, max: 7 },
  { desc: 'POS DEBIT - LOCAL BISTRO', min: 25, max: 65 },

  // Groceries
  { desc: 'WHOLE FOODS MARKET #10847', min: 45, max: 120 },
  { desc: 'TRADER JOE\'S #127', min: 30, max: 80 },
  { desc: 'COSTCO WHOLESALE #482', min: 80, max: 220 },
  { desc: 'TARGET #1892', min: 20, max: 65 },
  { desc: 'INSTACART *WEGMANS', min: 50, max: 130 },

  // Transport
  { desc: 'UBER *TRIP', min: 8, max: 35 },
  { desc: 'LYFT *RIDE', min: 10, max: 28 },
  { desc: 'SHELL OIL STATION', min: 35, max: 65 },
  { desc: 'CHEVRON #92847', min: 30, max: 58 },
  { desc: 'PARKING METER - DOWNTOWN', min: 5, max: 15 },

  // Shopping
  { desc: 'AMAZON.COM *AMZN', min: 15, max: 180 },
  { desc: 'APPLE STORE ONLINE', min: 30, max: 200 },
  { desc: 'NIKE.COM', min: 45, max: 150 },
  { desc: 'IKEA HOME FURNISHINGS', min: 50, max: 300 },
  { desc: 'BEST BUY #00847', min: 40, max: 250 },

  // Subscriptions (fixed amounts)
  { desc: 'NETFLIX.COM', min: 15.49, max: 15.49, recurring: true },
  { desc: 'SPOTIFY USA', min: 10.99, max: 10.99, recurring: true },
  { desc: 'ADOBE *CREATIVE CLD', min: 54.99, max: 54.99, recurring: true },
  { desc: 'GITHUB INC', min: 4.00, max: 4.00, recurring: true },
  { desc: 'YOUTUBE PREMIUM', min: 13.99, max: 13.99, recurring: true },
  { desc: 'NOTION LABS INC', min: 8.00, max: 8.00, recurring: true },
  { desc: 'HULU *SUBSCRIPTION', min: 17.99, max: 17.99, recurring: true },

  // Utilities
  { desc: 'COMCAST *INTERNET', min: 79.99, max: 79.99, recurring: true },
  { desc: 'AT&T *WIRELESS', min: 85.00, max: 85.00, recurring: true },
  { desc: 'CITY WATER & POWER', min: 60, max: 120 },

  // Health
  { desc: 'CVS PHARMACY #4827', min: 8, max: 45 },
  { desc: 'EQUINOX FITNESS', min: 99.00, max: 99.00, recurring: true },
  { desc: 'WALGREENS #12847', min: 10, max: 30 },

  // Entertainment
  { desc: 'STEAM GAMES', min: 10, max: 60 },
  { desc: 'AMC THEATRES #029', min: 15, max: 35 },
  { desc: 'TICKETMASTER *EVENT', min: 50, max: 200 },

  // Travel
  { desc: 'AIRBNB *HMRC482', min: 120, max: 350 },
  { desc: 'DELTA AIR LINES', min: 200, max: 500 },
  { desc: 'MARRIOTT HOTEL', min: 150, max: 400 },

  // Education
  { desc: 'UDEMY ONLINE COURSE', min: 12, max: 30 },
  { desc: 'COURSERA SUBSCRIPTION', min: 49, max: 49, recurring: true },

  // Transfers
  { desc: 'VENMO *PAYMENT', min: 10, max: 100 },
  { desc: 'ZELLE *TRANSFER', min: 20, max: 200 },
];

function randomBetween(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function randomDate(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function seed() {
  console.log('Seeding demo data...\n');

  // Create demo user
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);
  const userId = uuidv4();

  try {
    db.prepare('DELETE FROM insights WHERE user_id IN (SELECT id FROM users WHERE email = ?)').run(DEMO_USER.email);
    db.prepare('DELETE FROM transactions WHERE user_id IN (SELECT id FROM users WHERE email = ?)').run(DEMO_USER.email);
    db.prepare('DELETE FROM statements WHERE user_id IN (SELECT id FROM users WHERE email = ?)').run(DEMO_USER.email);
    db.prepare('DELETE FROM users WHERE email = ?').run(DEMO_USER.email);
  } catch (e) {}

  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(
    userId, DEMO_USER.email, passwordHash, DEMO_USER.name
  );
  console.log(`Created user: ${DEMO_USER.email} / ${DEMO_USER.password}`);

  // Create statement
  const statementId = uuidv4();
  db.prepare(`
    INSERT INTO statements (id, user_id, filename, original_name, file_type, file_hash, row_count, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')
  `).run(statementId, userId, 'seed_data.csv', 'seed_data.csv', 'csv', uuidv4(), 0);

  // Generate 6 months of transactions
  const insertTxn = db.prepare(`
    INSERT INTO transactions (id, user_id, statement_id, transaction_date, description, merchant, amount, type, category, is_recurring, raw_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  let txnCount = 0;

  const insertAll = db.transaction(() => {
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // Generate 40-70 transactions per month
      const numTxns = 40 + Math.floor(Math.random() * 30);

      for (let i = 0; i < numTxns; i++) {
        const template = TRANSACTIONS[Math.floor(Math.random() * TRANSACTIONS.length)];
        const amount = randomBetween(template.min, template.max);
        const txnDate = randomDate(year, month);
        const merchant = extractMerchant(template.desc);
        const category = categorizeTransaction(template.desc);

        // 5% chance of credit
        const isCredit = Math.random() < 0.05;

        insertTxn.run(
          uuidv4(),
          userId,
          statementId,
          txnDate,
          template.desc,
          merchant,
          amount,
          isCredit ? 'credit' : 'debit',
          category,
          template.recurring ? 1 : 0,
          JSON.stringify({ seeded: true })
        );
        txnCount++;
      }
    }
  });

  insertAll();

  // Update row count
  db.prepare('UPDATE statements SET row_count = ? WHERE id = ?').run(txnCount, statementId);

  console.log(`Generated ${txnCount} transactions across 6 months`);

  // Generate insights
  const insights = generateInsights(userId);
  console.log(`Generated ${insights.length} insights`);

  console.log('\n✓ Seed complete!');
  console.log(`\nLogin with:\n  Email: ${DEMO_USER.email}\n  Password: ${DEMO_USER.password}`);
}

seed().catch(console.error);
