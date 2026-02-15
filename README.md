# Lumina — Financial Spending Insights

A design-forward fintech web application that visualizes credit card spending data with a premium, editorial aesthetic. Upload CSV statements and receive intelligent spending analysis, category breakdowns, trend detection, and subscription tracking.

**Live demo credentials:** `demo@lumina.app` / `demo1234`

---

## Features

### Backend
- **JWT Authentication** — Secure login/register with bcrypt password hashing and role-based access
- **CSV Statement Ingestion** — Flexible parser that auto-detects column formats, handles multiple date formats, and rejects duplicates via SHA-256 hashing
- **Transaction Enrichment** — Rule-based categorization across 13 spending categories with merchant name extraction
- **Recurring Detection** — Identifies monthly subscriptions based on amount consistency and timing patterns
- **Analytics Engine** — Monthly trends, category breakdowns, top merchants, spending spike detection, and subscription creep analysis
- **Rate Limiting** — Request throttling on auth and API endpoints
- **Data Deletion** — Full account and data deletion flow

### Frontend
- **Dark-mode-first** design with liquid glass / frosted acrylic surfaces
- **Spring-based animations** via Framer Motion (no linear easing)
- **Area charts** with gradient fills that animate progressively
- **Category breakdown** with horizontal bar visualization and hover interactions
- **Transaction table** with search, sort, pagination, and category filter pills
- **Drag-and-drop file upload** with validation, progress, and success states
- **Insight cards** with severity-coded icons that emerge with staggered spring animations
- **Ambient background** with slowly drifting gradient orbs
- **Responsive layout** optimized for both desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Framer Motion, Recharts, Lucide Icons |
| Backend | Node.js, Express, SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Parsing | csv-parse |
| Design | Custom CSS with backdrop-filter, Inter + JetBrains Mono |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone and install dependencies
cd server && npm install
cd ../client && npm install
```

### Seed Demo Data

```bash
cd server && node src/seed.js
```

This creates a demo user with 6 months of realistic transaction data.

### Run Development Servers

Terminal 1 — Backend:
```bash
cd server && npm run dev
```

Terminal 2 — Frontend:
```bash
cd client && npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:3001`.

### Build for Production

```bash
cd client && npm run build
cd ../server && npm start
```

The Express server serves the built frontend from `client/dist`.

---

## Project Structure

```
├── server/
│   ├── src/
│   │   ├── index.js              # Express server entry
│   │   ├── seed.js               # Demo data generator
│   │   ├── models/database.js    # SQLite schema & connection
│   │   ├── middleware/auth.js     # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js           # Register, login, account deletion
│   │   │   ├── statements.js     # Upload, list, delete statements
│   │   │   └── analytics.js      # Overview, trends, categories, merchants
│   │   ├── services/
│   │   │   ├── csvParser.js      # Flexible CSV parsing engine
│   │   │   └── enrichment.js     # Categorization, insights, recurring detection
│   │   └── utils/categories.js   # Category rules, colors, labels
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── App.jsx               # Routes and auth guards
│   │   ├── main.jsx              # Entry point
│   │   ├── styles/global.css     # Design system tokens
│   │   ├── context/AuthContext.jsx
│   │   ├── utils/
│   │   │   ├── api.js            # API client with token management
│   │   │   └── format.js         # Currency, date, number formatters
│   │   ├── components/
│   │   │   ├── GlassCard.jsx     # Frosted glass surface component
│   │   │   ├── AnimatedNumber.jsx # Spring-animated number counter
│   │   │   ├── StatCard.jsx      # Overview stat cards
│   │   │   ├── SpendingChart.jsx # Area chart with gradients
│   │   │   ├── CategoryChart.jsx # Horizontal bar chart
│   │   │   ├── MerchantList.jsx  # Ranked merchant list
│   │   │   ├── InsightCard.jsx   # Severity-coded insight cards
│   │   │   ├── TransactionTable.jsx # Sortable, searchable table
│   │   │   ├── FileUpload.jsx    # Drag-and-drop upload
│   │   │   ├── Navigation.jsx    # Top navigation bar
│   │   │   └── PageTransition.jsx # Animated route transitions
│   │   └── pages/
│   │       ├── DashboardPage.jsx # Main overview dashboard
│   │       ├── TransactionsPage.jsx
│   │       ├── UploadPage.jsx
│   │       ├── InsightsPage.jsx
│   │       ├── LoginPage.jsx
│   │       └── RegisterPage.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| DELETE | `/api/auth/account` | Delete account + all data |

### Statements
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/statements/upload` | Upload CSV statement |
| GET | `/api/statements` | List user's statements |
| DELETE | `/api/statements/:id` | Delete statement + transactions |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Dashboard totals |
| GET | `/api/analytics/monthly` | Monthly spending trends |
| GET | `/api/analytics/categories` | Category breakdown |
| GET | `/api/analytics/merchants` | Top merchants |
| GET | `/api/analytics/transactions` | Filtered transaction list |
| GET | `/api/analytics/insights` | Generated insights |
| GET | `/api/analytics/recurring` | Detected subscriptions |
| GET | `/api/analytics/daily` | Daily spending data |

---

## CSV Format Support

The parser auto-detects columns by matching common header names:

- **Date:** `Date`, `Transaction Date`, `Post Date`, `Posting Date`
- **Description:** `Description`, `Merchant`, `Name`, `Memo`, `Payee`
- **Amount:** `Amount`, `Transaction Amount`, `Debit`, `Charge`
- **Credit:** `Credit`, `Payment`, `Credit Amount`

Supported date formats: `YYYY-MM-DD`, `MM/DD/YYYY`, `MM-DD-YYYY`, `MM/DD/YY`

---

## Design Philosophy

- **Calm, confident, expensive** — not a typical SaaS dashboard
- **Negative space** used generously
- **Spring-based motion** — every animation has physical, continuous feel
- **Muted palette** with intentional accent colors
- **Frosted glass surfaces** with subtle depth via backdrop-filter
- **Editorial rhythm** — staggered content, not dense grids
- **Charts as visual stories** — thin strokes, gentle labels, no heavy gridlines
