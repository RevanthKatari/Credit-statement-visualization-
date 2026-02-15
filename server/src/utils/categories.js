// Rule-based transaction categorization engine
const CATEGORY_RULES = [
  {
    category: 'dining',
    label: 'Dining & Restaurants',
    keywords: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'burger', 'pizza', 'sushi', 'doordash', 'grubhub', 'uber eats', 'ubereats', 'chipotle', 'subway', 'wendy', 'taco bell', 'dunkin', 'panera', 'chick-fil-a', 'panda express', 'dine', 'eatery', 'bistro', 'grill', 'bakery', 'deli']
  },
  {
    category: 'groceries',
    label: 'Groceries',
    keywords: ['grocery', 'whole foods', 'trader joe', 'kroger', 'safeway', 'costco', 'walmart', 'target', 'aldi', 'publix', 'wegmans', 'heb', 'market', 'fresh', 'food lion', 'instacart', 'sam\'s club']
  },
  {
    category: 'transport',
    label: 'Transportation',
    keywords: ['uber', 'lyft', 'gas', 'fuel', 'shell', 'chevron', 'exxon', 'bp', 'parking', 'toll', 'transit', 'metro', 'train', 'airline', 'flight', 'delta', 'united', 'american air', 'southwest', 'jetblue', 'amtrak']
  },
  {
    category: 'shopping',
    label: 'Shopping',
    keywords: ['amazon', 'ebay', 'etsy', 'nike', 'adidas', 'zara', 'h&m', 'gap', 'nordstrom', 'macy', 'best buy', 'apple store', 'ikea', 'home depot', 'lowes', 'wayfair', 'clothing', 'apparel', 'shoe']
  },
  {
    category: 'subscriptions',
    label: 'Subscriptions',
    keywords: ['netflix', 'spotify', 'hulu', 'disney+', 'hbo', 'apple music', 'youtube premium', 'adobe', 'microsoft 365', 'dropbox', 'icloud', 'notion', 'figma', 'github', 'aws', 'heroku', 'vercel', 'membership', 'subscription', 'monthly']
  },
  {
    category: 'utilities',
    label: 'Utilities & Bills',
    keywords: ['electric', 'water', 'gas bill', 'internet', 'comcast', 'verizon', 'at&t', 't-mobile', 'sprint', 'phone bill', 'utility', 'power', 'energy', 'sewage']
  },
  {
    category: 'health',
    label: 'Health & Wellness',
    keywords: ['pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'medical', 'dental', 'vision', 'gym', 'fitness', 'yoga', 'peloton', 'health', 'therapy', 'clinic', 'urgent care']
  },
  {
    category: 'entertainment',
    label: 'Entertainment',
    keywords: ['movie', 'cinema', 'theater', 'concert', 'ticket', 'game', 'steam', 'playstation', 'xbox', 'nintendo', 'amusement', 'museum', 'bowling', 'arcade', 'event']
  },
  {
    category: 'travel',
    label: 'Travel & Hotels',
    keywords: ['hotel', 'airbnb', 'booking.com', 'expedia', 'marriott', 'hilton', 'hyatt', 'resort', 'vacation', 'rental car', 'hertz', 'enterprise', 'avis']
  },
  {
    category: 'education',
    label: 'Education',
    keywords: ['tuition', 'university', 'college', 'school', 'course', 'udemy', 'coursera', 'textbook', 'education', 'learning', 'student']
  },
  {
    category: 'insurance',
    label: 'Insurance',
    keywords: ['insurance', 'geico', 'state farm', 'allstate', 'progressive', 'premium', 'policy']
  },
  {
    category: 'transfers',
    label: 'Transfers & Payments',
    keywords: ['venmo', 'zelle', 'paypal', 'cashapp', 'cash app', 'transfer', 'payment', 'wire']
  }
];

export function categorizeTransaction(description) {
  const lower = description.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        return rule.category;
      }
    }
  }
  return 'uncategorized';
}

export function extractMerchant(description) {
  // Clean up common prefixes/suffixes
  let merchant = description
    .replace(/^(pos|ach|debit|credit|purchase|sale|payment)\s*/i, '')
    .replace(/\s*(#\d+|ref\s*#?\d+|\d{4,}|xx\d+).*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Capitalize first letter of each word
  merchant = merchant.replace(/\b\w/g, c => c.toUpperCase());
  return merchant || description;
}

export const CATEGORY_COLORS = {
  dining: '#FF6B6B',
  groceries: '#4ECDC4',
  transport: '#45B7D1',
  shopping: '#96CEB4',
  subscriptions: '#A78BFA',
  utilities: '#F9CA24',
  health: '#FF8A80',
  entertainment: '#69DB7C',
  travel: '#74B9FF',
  education: '#FD79A8',
  insurance: '#FDCB6E',
  transfers: '#81ECEC',
  uncategorized: '#636E72'
};

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_RULES.map(r => [r.category, r.label])
);
CATEGORY_LABELS.uncategorized = 'Other';

export default CATEGORY_RULES;
