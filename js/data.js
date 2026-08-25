/* ============================================
   Stackly — Shared Data & Demo Content
   ============================================
   Centralized demo data used by both dashboards
   and landing pages. Uses localStorage to persist
   transactions, customers and session state so the
   app feels like a real banking application.
   ============================================ */

const STORAGE_KEYS = {
  theme: 'nb_theme',
  customers: 'nb_customers_v2',
  transactions: 'nb_transactions_v2',
  loans: 'nb_loans_v2',
  cards: 'nb_cards_v2',
  notifications: 'nb_notifications_v2',
  session: 'nb_session',
  investments: 'nb_investments_v2',
};

/* ---- Seed data ---- */
const seedCustomers = [
  { id: 'CUST-1001', name: 'Sarah Klein', email: 'sarah.klein@email.com', phone: '+1 555-0101', type: 'Personal', status: 'active', balance: 847250, joined: '2023-03-15', avatar: 'SK' },
  { id: 'CUST-1002', name: 'Marcus Reid', email: 'marcus.reid@email.com', phone: '+1 555-0102', type: 'Business', status: 'active', balance: 1240500, joined: '2022-11-08', avatar: 'MR' },
  { id: 'CUST-1003', name: 'Amelia Lee', email: 'amelia.lee@email.com', phone: '+1 555-0103', type: 'Premium', status: 'active', balance: 2150000, joined: '2021-07-22', avatar: 'AL' },
  { id: 'CUST-1004', name: 'James Carter', email: 'james.carter@email.com', phone: '+1 555-0104', type: 'Personal', status: 'pending', balance: 45200, joined: '2024-01-10', avatar: 'JC' },
  { id: 'CUST-1005', name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '+1 555-0105', type: 'Business', status: 'active', balance: 567800, joined: '2023-09-03', avatar: 'PS' },
  { id: 'CUST-1006', name: 'David Chen', email: 'david.chen@email.com', phone: '+1 555-0106', type: 'Personal', status: 'inactive', balance: 12300, joined: '2022-05-18', avatar: 'DC' },
  { id: 'CUST-1007', name: 'Elena Rodriguez', email: 'elena.r@email.com', phone: '+1 555-0107', type: 'Premium', status: 'active', balance: 1890000, joined: '2021-12-14', avatar: 'ER' },
  { id: 'CUST-1008', name: 'Tom Wilson', email: 'tom.wilson@email.com', phone: '+1 555-0108', type: 'Personal', status: 'active', balance: 78400, joined: '2023-06-29', avatar: 'TW' },
];

const seedTransactions = [
  { id: 'TXN-50001', customer: 'Sarah Klein', accountId: 'ACC-4829', type: 'Deposit', amount: 5000, status: 'completed', date: '2026-08-24', method: 'Wire Transfer', desc: 'Salary deposit' },
  { id: 'TXN-50002', customer: 'Marcus Reid', accountId: 'ACC-3022', type: 'Transfer', amount: 12500, status: 'completed', date: '2026-08-23', method: 'ACH', desc: 'Vendor payment' },
  { id: 'TXN-50003', customer: 'Amelia Lee', accountId: 'ACC-7715', type: 'Withdrawal', amount: 3200, status: 'completed', date: '2026-08-23', method: 'ATM', desc: 'ATM withdrawal' },
  { id: 'TXN-50004', customer: 'James Carter', accountId: 'ACC-9981', type: 'Deposit', amount: 1200, status: 'pending', date: '2026-08-22', method: 'Check', desc: 'Check deposit' },
  { id: 'TXN-50005', customer: 'Priya Sharma', accountId: 'ACC-6634', type: 'Payment', amount: 890, status: 'completed', date: '2026-08-22', method: 'Online', desc: 'Utility bill' },
  { id: 'TXN-50006', customer: 'David Chen', accountId: 'ACC-2047', type: 'Transfer', amount: 450, status: 'failed', date: '2026-08-21', method: 'Wire Transfer', desc: 'Transfer to external bank' },
  { id: 'TXN-50007', customer: 'Elena Rodriguez', accountId: 'ACC-5512', type: 'Deposit', amount: 18000, status: 'completed', date: '2026-08-21', method: 'Wire Transfer', desc: 'Investment return' },
  { id: 'TXN-50008', customer: 'Tom Wilson', accountId: 'ACC-8890', type: 'Withdrawal', amount: 600, status: 'completed', date: '2026-08-20', method: 'ATM', desc: 'Cash withdrawal' },
  { id: 'TXN-50009', customer: 'Sarah Klein', accountId: 'ACC-4829', type: 'Payment', amount: 145, status: 'completed', date: '2026-08-20', method: 'Card', desc: 'Grocery shopping' },
  { id: 'TXN-50010', customer: 'Marcus Reid', accountId: 'ACC-3022', type: 'Deposit', amount: 22000, status: 'completed', date: '2026-08-19', method: 'ACH', desc: 'Client payment' },
  { id: 'TXN-50011', customer: 'Sarah Klein', accountId: 'ACC-4829', type: 'Transfer', amount: 300, status: 'completed', date: '2026-08-18', method: 'Wire Transfer', desc: 'Rent payment' },
  { id: 'TXN-50012', customer: 'Sarah Klein', accountId: 'ACC-7730', type: 'Deposit', amount: 1500, status: 'completed', date: '2026-08-17', method: 'ACH', desc: 'Bonus deposit' },
  { id: 'TXN-50013', customer: 'Sarah Klein', accountId: 'ACC-4829', type: 'Withdrawal', amount: 200, status: 'completed', date: '2026-08-15', method: 'ATM', desc: 'Cash withdrawal' },
  { id: 'TXN-50014', customer: 'Sarah Klein', accountId: 'ACC-4829', type: 'Payment', amount: 85, status: 'completed', date: '2026-08-14', method: 'Card', desc: 'Electric Bill' },
  { id: 'TXN-50015', customer: 'Sarah Klein', accountId: 'ACC-4829', type: 'Payment', amount: 45, status: 'completed', date: '2026-08-12', method: 'Card', desc: 'Internet Bill' },
  { id: 'TXN-50016', customer: 'Sarah Klein', accountId: 'ACC-7730', type: 'Transfer', amount: 500, status: 'completed', date: '2026-08-10', method: 'Internal Transfer', desc: 'Transfer to savings' },
  { id: 'TXN-50017', customer: 'Sarah Klein', accountId: 'ACC-4829', type: 'Payment', amount: 120, status: 'pending', date: '2026-08-09', method: 'Card', desc: 'Amazon Purchase' },
  { id: 'TXN-50018', customer: 'Sarah Klein', accountId: 'ACC-4829', type: 'Deposit', amount: 200, status: 'completed', date: '2026-08-08', method: 'Zelle', desc: 'Refund received' },
];

const seedLoans = [
  { id: 'LOAN-2001', customer: 'Sarah Klein', type: 'Home Loan', amount: 350000, remaining: 287500, rate: 3.5, term: 360, emi: 1567, status: 'active', nextDue: '2026-09-01' },
  { id: 'LOAN-2002', customer: 'Marcus Reid', type: 'Business Loan', amount: 500000, remaining: 412000, rate: 4.2, term: 60, emi: 9245, status: 'active', nextDue: '2026-09-05' },
  { id: 'LOAN-2003', customer: 'Amelia Lee', type: 'Auto Loan', amount: 65000, remaining: 28900, rate: 2.9, term: 72, emi: 985, status: 'active', nextDue: '2026-09-03' },
  { id: 'LOAN-2004', customer: 'James Carter', type: 'Personal Loan', amount: 25000, remaining: 24800, rate: 6.8, term: 36, emi: 769, status: 'pending', nextDue: '2026-09-10' },
  { id: 'LOAN-2005', customer: 'Priya Sharma', type: 'Home Loan', amount: 280000, remaining: 198000, rate: 3.7, term: 300, emi: 1304, status: 'active', nextDue: '2026-09-07' },
  { id: 'LOAN-2006', customer: 'Sarah Klein', type: 'Auto Loan', amount: 45000, remaining: 15000, rate: 4.5, term: 60, emi: 850, status: 'active', nextDue: '2026-09-15' },
  { id: 'LOAN-2007', customer: 'Sarah Klein', type: 'Personal Loan', amount: 10000, remaining: 8000, rate: 8.0, term: 24, emi: 450, status: 'active', nextDue: '2026-09-20' },
  { id: 'LOAN-2008', customer: 'Sarah Klein', type: 'Education Loan', amount: 20000, remaining: 5000, rate: 5.5, term: 120, emi: 200, status: 'active', nextDue: '2026-09-25' },
];

const seedCards = [
  { id: 'CARD-01', customer: 'Sarah Klein', type: 'Visa Platinum', number: '4532 **** **** 4829', expiry: '08/29', limit: 50000, spent: 12300, status: 'active', color: 'blue' },
  { id: 'CARD-02', customer: 'Sarah Klein', type: 'Mastercard Gold', number: '5412 **** **** 7715', expiry: '11/28', limit: 25000, spent: 5400, status: 'active', color: 'gold' },
  { id: 'CARD-03', customer: 'Marcus Reid', type: 'Visa Business', number: '4129 **** **** 3022', expiry: '03/30', limit: 100000, spent: 34500, status: 'active', color: 'emerald' },
  { id: 'CARD-04', customer: 'Amelia Lee', type: 'Visa Infinite', number: '4532 **** **** 5512', expiry: '06/29', limit: 200000, spent: 89000, status: 'active', color: 'dark' },
  { id: 'CARD-05', customer: 'James Carter', type: 'Debit Mastercard', number: '5412 **** **** 9981', expiry: '02/28', limit: 10000, spent: 2100, status: 'frozen', color: 'blue' },
  { id: 'CARD-06', customer: 'Sarah Klein', type: 'Visa Travel', number: '4123 **** **** 9081', expiry: '05/27', limit: 15000, spent: 3000, status: 'active', color: 'emerald' },
  { id: 'CARD-07', customer: 'Sarah Klein', type: 'Mastercard Rewards', number: '5100 **** **** 4421', expiry: '10/28', limit: 10000, spent: 8500, status: 'active', color: 'purple' },
  { id: 'CARD-08', customer: 'Sarah Klein', type: 'Visa Signature', number: '4532 **** **** 1122', expiry: '12/29', limit: 100000, spent: 45000, status: 'active', color: 'dark' },
  { id: 'CARD-09', customer: 'Sarah Klein', type: 'Debit Visa', number: '4111 **** **** 8877', expiry: '01/30', limit: 5000, spent: 500, status: 'active', color: 'info' },
];

const seedNotifications = [
  { id: 1, icon: 'bi-arrow-down-left', color: 'success', title: 'Deposit Received', desc: '$5,000 has been deposited to your account', time: '2 min ago', read: false, type: 'transaction' },
  { id: 2, icon: 'bi-shield-check', color: 'info', title: 'Security Alert', desc: 'New login from Chrome on Windows', time: '1 hour ago', read: false, type: 'security' },
  { id: 3, icon: 'bi-credit-card', color: 'warning', title: 'Card Payment Due', desc: 'Your Visa Platinum payment is due in 3 days', time: '5 hours ago', read: false, type: 'card' },
  { id: 4, icon: 'bi-graph-up', color: 'primary', title: 'Investment Update', desc: 'Your portfolio grew by 2.3% this week', time: '1 day ago', read: true, type: 'investment' },
  { id: 5, icon: 'bi-house', color: 'info', title: 'EMI Reminder', desc: 'Home loan EMI of $1,567 due on Sep 1', time: '2 days ago', read: true, type: 'loan' },
];

const seedInvestments = [
  { id: 'INV-01', name: 'Tech Growth ETF', symbol: 'TGT', value: 45200, change: 3.4, shares: 120, color: 'primary' },
  { id: 'INV-02', name: 'S&P 500 Index', symbol: 'SPX', value: 38700, change: 1.8, shares: 85, color: 'success' },
  { id: 'INV-03', name: 'Global Bond Fund', symbol: 'GBF', value: 21300, change: -0.5, shares: 200, color: 'info' },
  { id: 'INV-04', name: 'Emerging Markets', symbol: 'EMF', value: 18500, change: 5.2, shares: 150, color: 'warning' },
];

/* ---- Persistence helpers ---- */
function read(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return seed;
}

function write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

const store = {
  getCustomers() { return read(STORAGE_KEYS.customers, seedCustomers); },
  setCustomers(d) { write(STORAGE_KEYS.customers, d); },
  getTransactions() { return read(STORAGE_KEYS.transactions, seedTransactions); },
  setTransactions(d) { write(STORAGE_KEYS.transactions, d); },
  getLoans() { return read(STORAGE_KEYS.loans, seedLoans); },
  setLoans(d) { write(STORAGE_KEYS.loans, d); },
  getCards() { return read(STORAGE_KEYS.cards, seedCards); },
  setCards(d) { write(STORAGE_KEYS.cards, d); },
  getNotifications() { return read(STORAGE_KEYS.notifications, seedNotifications); },
  setNotifications(d) { write(STORAGE_KEYS.notifications, d); },
  getInvestments() { return read(STORAGE_KEYS.investments, seedInvestments); },
  setInvestments(d) { write(STORAGE_KEYS.investments, d); },
  getSession() { return read(STORAGE_KEYS.session, null); },
  setSession(d) { write(STORAGE_KEYS.session, d); },
  clearSession() { localStorage.removeItem(STORAGE_KEYS.session); },
};

/* ---- Formatting helpers ---- */
function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

