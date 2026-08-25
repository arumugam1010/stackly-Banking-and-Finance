/* ============================================
   Stackly — Customer Dashboard JS
   ============================================
   Renders all customer portal pages:
   Overview, My Accounts, Balance, Transactions,
   Fund Transfer, Deposit, Withdrawal, Loan Details,
   EMI Schedule, Cards, Investments, Payment History,
   Notifications, Profile, Settings
   ============================================ */




/* ---- Global state ---- */
const charts = {};
let currentPage = 'overview';
const session = typeof store !== 'undefined' ? store.getSession() : null;
const sessionName = session && session.name ? session.name : 'Sarah Klein';
const firstName = sessionName.split(' ')[0];
const avatarInitials = sessionName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

const CUSTOMER = { 
  name: sessionName, 
  firstName: firstName,
  id: 'CUST-1001', 
  email: session && session.email ? session.email : 'sarah.klein@email.com', 
  avatar: avatarInitials, 
  balance: 847250, 
  accNum: '**** 4829' 
};
/* ---- Chart helpers ---- */
function chartTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  return {
    grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,31,61,0.05)',
    ticks: isDark ? '#94a3b8' : '#475569',
  };
}

function destroyCharts() {
  Object.values(charts).forEach(c => { try { c.destroy(); } catch (e) {} });
  Object.keys(charts).forEach(k => delete charts[k]);
}

/* ---- Sidebar ---- */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('dashboardMain');
  const backdrop = document.getElementById('sidebarBackdrop');
  const toggle = document.getElementById('sidebarToggle');
  const mobileToggle = document.getElementById('mobileToggle');

  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('collapsed');
  });

  mobileToggle?.addEventListener('click', () => {
    sidebar.classList.add('show');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  });

  backdrop?.addEventListener('click', () => {
    sidebar.classList.remove('show');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  });

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (!page) return;
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      currentPage = page;
      renderPage(page);
      sidebar.classList.remove('show');
      backdrop.classList.remove('show');
      document.body.style.overflow = '';
    });
  });

  const brandLogo = document.getElementById('dashboardBrandLogo');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof navigateTo === 'function') {
        navigateTo('overview');
      }
    });
  }
}

/* ---- Theme ---- */
function initThemeToggle() {
  document.documentElement.setAttribute('data-theme', 'light');
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.style.display = 'none';
}

/* ---- Notifications button ---- */
function initNotifBtn() {
  const btn = document.getElementById('notifBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    currentPage = 'notifications';
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.page === 'notifications'));
    renderPage('notifications');
  });
}

/* ---- Logout ---- */
window.logout = function() {
  store.clearSession();
  window.location.href = 'login.html';
};

/* ---- Page router ---- */
function renderPage(page) {
  destroyCharts();
  const content = document.getElementById('dashboardContent');
  if (!content) return;

  const pages = {
    overview: renderOverview,
    accounts: renderAccounts,
    balance: renderBalance,
    transactions: renderTransactions,
    transfer: renderTransfer,
    deposit: renderDeposit,
    withdrawal: renderWithdrawal,
    loans: renderLoans,
    emi: renderEmi,
    cards: renderCards,
    investments: renderInvestments,
    payments: renderPayments,
    notifications: renderNotifications,
    profile: renderProfile,
    settings: renderSettings,
  };

  const fn = pages[page] || pages.overview;
  content.innerHTML = fn();
  initPageEvents(page);
}

/* ---- Helpers ---- */
function statusBadge(status) {
  const map = { active: 'success', completed: 'success', pending: 'warning', inactive: 'secondary', failed: 'danger', frozen: 'warning' };
  return `<span class="badge badge-${map[status] || 'secondary'}">${status}</span>`;
}

function myTransactions() {
  const txns = store.getTransactions().filter(t => t.customer === CUSTOMER.name);
  return txns.length > 0 ? txns : store.getTransactions().filter(t => t.customer === 'Sarah Klein');
}

function myLoans() {
  const loans = store.getLoans().filter(l => l.customer === CUSTOMER.name);
  return loans.length > 0 ? loans : store.getLoans().filter(l => l.customer === 'Sarah Klein');
}

function myCards() {
  const cards = store.getCards().filter(c => c.customer === CUSTOMER.name);
  return cards.length > 0 ? cards : store.getCards().filter(c => c.customer === 'Sarah Klein');
}

/* ============================================
   PAGE: Overview
   ============================================ */
function renderOverview() {
  const txns = myTransactions();
  const income = txns.filter(t => t.type === 'Deposit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const expense = txns.filter(t => (t.type === 'Withdrawal' || t.type === 'Payment') && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const recent = txns.slice(0, 5);
  const notifs = store.getNotifications().slice(0, 3);

  return `
    <div class="page-title-row">
      <div><h1>Welcome back, ${CUSTOMER.firstName}</h1><p>Here's your financial overview.</p></div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-lg-6">
        <div class="balance-hero-card">
          <p class="balance-hero-card__label">Available Balance</p>
          <h2 class="balance-hero-card__amount">${formatCurrency(CUSTOMER.balance)}</h2>
          <p class="text-muted-2" style="margin:0">Account ${CUSTOMER.accNum}</p>
          <div class="balance-hero-card__sub">
            <div class="balance-hero-card__sub-item"><small>Account Type</small><span>Personal Premium</span></div>
            <div class="balance-hero-card__sub-item"><small>Status</small><span class="text-success">Active</span></div>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="glass-card p-3 h-100">
          <h5 class="mb-3">Quick Actions</h5>
          <div class="quick-actions">
            <div class="quick-action-btn" onclick="navigateTo('transfer')"><i class="bi bi-send"></i><span>Transfer</span></div>
            <div class="quick-action-btn" onclick="navigateTo('deposit')"><i class="bi bi-arrow-down-circle"></i><span>Deposit</span></div>
            <div class="quick-action-btn" onclick="navigateTo('withdrawal')"><i class="bi bi-arrow-up-circle"></i><span>Withdraw</span></div>
            <div class="quick-action-btn" onclick="navigateTo('cards')"><i class="bi bi-credit-card-2-front"></i><span>Cards</span></div>
          </div>
          <hr class="my-3" style="border-color:var(--border-glass)">
          <div class="row g-2">
            <div class="col-6"><small class="text-muted-2">Income (Aug)</small><h5 class="text-success mb-0">${formatCurrency(income)}</h5></div>
            <div class="col-6"><small class="text-muted-2">Spending (Aug)</small><h5 class="text-danger mb-0">${formatCurrency(expense)}</h5></div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-lg-8">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>Spending Analytics</h3><span class="badge badge-info">Last 6 months</span></div>
          <div class="chart-container"><canvas id="ovChart1"></canvas></div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>Income vs Expense</h3></div>
          <div class="chart-container"><canvas id="ovChart2"></canvas></div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-8">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>Recent Transactions</h3><a style="cursor:pointer;font-size:0.8rem" onclick="navigateTo('transactions')">View all <i class="bi bi-arrow-right"></i></a></div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Description</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                ${recent.map(t => `
                  <tr>
                    <td>${t.desc}</td>
                    <td><span class="badge badge-${t.type==='Deposit'?'success':t.type==='Withdrawal'?'danger':'info'}">${t.type}</span></td>
                    <td class="${t.type==='Deposit'?'text-success':'text-danger'}">${t.type==='Deposit'?'+':'-'}${formatCurrency(t.amount)}</td>
                    <td><small>${formatDate(t.date)}</small></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>Notifications</h3></div>
          ${notifs.map(n => `
            <div class="notification-item ${n.read?'':'unread'}" style="margin:0 0 0.5rem;padding:0.75rem">
              <div class="notification-item__icon bg-${n.color}-soft"><i class="bi ${n.icon}"></i></div>
              <div class="notification-item__body"><h4 style="font-size:0.85rem">${n.title}</h4><p style="font-size:0.75rem">${n.desc}</p></div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: My Accounts
   ============================================ */
function renderAccounts() {
  return `
    <div class="page-title-row"><div><h1>My Accounts</h1><p>View and manage all your bank accounts.</p></div></div>
    <div class="row g-3">
      <div class="col-md-6 col-lg-4">
        <div class="glass-card account-card">
          <div class="account-card__header">
            <div class="account-card__type"><div class="account-card__type-icon bg-primary-soft"><i class="bi bi-wallet2"></i></div><div><strong>Checking</strong><div class="account-card__num">ACC-4829</div></div></div>
            <span class="badge badge-success">Active</span>
          </div>
          <p class="account-card__balance">${formatCurrency(CUSTOMER.balance)}</p>
          <small class="text-muted-2">Primary account</small>
          <div class="d-flex gap-2 mt-3"><button class="btn btn-ghost btn-sm flex-fill" onclick="navigateTo('transactions')">Activity</button><button class="btn btn-ghost btn-sm" onclick="navigateTo('transfer')"><i class="bi bi-send"></i></button></div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="glass-card account-card">
          <div class="account-card__header">
            <div class="account-card__type"><div class="account-card__type-icon bg-success-soft"><i class="bi bi-piggy-bank"></i></div><div><strong>Savings</strong><div class="account-card__num">ACC-7730</div></div></div>
            <span class="badge badge-success">Active</span>
          </div>
          <p class="account-card__balance">${formatCurrency(154200)}</p>
          <small class="text-muted-2">4.5% APY &middot; High yield</small>
          <div class="d-flex gap-2 mt-3"><button class="btn btn-ghost btn-sm flex-fill" onclick="showToast('Details','Savings account details.','info')">Details</button></div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="glass-card account-card">
          <div class="account-card__header">
            <div class="account-card__type"><div class="account-card__type-icon bg-info-soft"><i class="bi bi-cash-coin"></i></div><div><strong>Investment</strong><div class="account-card__num">ACC-9912</div></div></div>
            <span class="badge badge-success">Active</span>
          </div>
          <p class="account-card__balance">${formatCurrency(123700)}</p>
          <small class="text-muted-2">Portfolio value</small>
          <div class="d-flex gap-2 mt-3"><button class="btn btn-ghost btn-sm flex-fill" onclick="navigateTo('investments')">View Portfolio</button></div>
        </div>
      </div>
      
      <!-- New Account Cards -->
      <div class="col-md-6 col-lg-4">
        <div class="glass-card account-card">
          <div class="account-card__header">
            <div class="account-card__type"><div class="account-card__type-icon bg-warning-soft"><i class="bi bi-people"></i></div><div><strong>Joint Checking</strong><div class="account-card__num">ACC-5521</div></div></div>
            <span class="badge badge-success">Active</span>
          </div>
          <p class="account-card__balance">${formatCurrency(45200)}</p>
          <small class="text-muted-2">Shared account</small>
          <div class="d-flex gap-2 mt-3"><button class="btn btn-ghost btn-sm flex-fill" onclick="navigateTo('transactions')">Activity</button></div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-4">
        <div class="glass-card account-card">
          <div class="account-card__header">
            <div class="account-card__type"><div class="account-card__type-icon bg-danger-soft"><i class="bi bi-safe"></i></div><div><strong>Fixed Deposit</strong><div class="account-card__num">FD-8890</div></div></div>
            <span class="badge badge-success">Active</span>
          </div>
          <p class="account-card__balance">${formatCurrency(50000)}</p>
          <small class="text-muted-2">6.5% APY &middot; Matures 2027</small>
          <div class="d-flex gap-2 mt-3"><button class="btn btn-ghost btn-sm flex-fill" onclick="showToast('Details','FD details.','info')">Details</button></div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-4">
        <div class="glass-card account-card">
          <div class="account-card__header">
            <div class="account-card__type"><div class="account-card__type-icon bg-primary-soft"><i class="bi bi-briefcase"></i></div><div><strong>Business Checking</strong><div class="account-card__num">ACC-1102</div></div></div>
            <span class="badge badge-success">Active</span>
          </div>
          <p class="account-card__balance">${formatCurrency(310500)}</p>
          <small class="text-muted-2">Corporate account</small>
          <div class="d-flex gap-2 mt-3"><button class="btn btn-ghost btn-sm flex-fill" onclick="navigateTo('transactions')">Activity</button><button class="btn btn-ghost btn-sm" onclick="navigateTo('transfer')"><i class="bi bi-send"></i></button></div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-4">
        <div class="glass-card account-card">
          <div class="account-card__header">
            <div class="account-card__type"><div class="account-card__type-icon bg-info-soft"><i class="bi bi-airplane"></i></div><div><strong>Travel Savings</strong><div class="account-card__num">ACC-3345</div></div></div>
            <span class="badge badge-success">Active</span>
          </div>
          <p class="account-card__balance">${formatCurrency(12500)}</p>
          <small class="text-muted-2">Goal: $15,000</small>
          <div class="d-flex gap-2 mt-3"><button class="btn btn-ghost btn-sm flex-fill" onclick="showToast('Details','Travel fund details.','info')">Details</button></div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-4">
        <div class="glass-card account-card">
          <div class="account-card__header">
            <div class="account-card__type"><div class="account-card__type-icon bg-success-soft"><i class="bi bi-gift"></i></div><div><strong>Holiday Fund</strong><div class="account-card__num">ACC-6678</div></div></div>
            <span class="badge badge-success">Active</span>
          </div>
          <p class="account-card__balance">${formatCurrency(3200)}</p>
          <small class="text-muted-2">Goal: $5,000</small>
          <div class="d-flex gap-2 mt-3"><button class="btn btn-ghost btn-sm flex-fill" onclick="showToast('Details','Holiday fund details.','info')">Details</button></div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-4">
        <div class="glass-card account-card">
          <div class="account-card__header">
            <div class="account-card__type"><div class="account-card__type-icon bg-warning-soft"><i class="bi bi-shield-check"></i></div><div><strong>Retirement (IRA)</strong><div class="account-card__num">ACC-9900</div></div></div>
            <span class="badge badge-success">Active</span>
          </div>
          <p class="account-card__balance">${formatCurrency(450800)}</p>
          <small class="text-muted-2">Long-term growth</small>
          <div class="d-flex gap-2 mt-3"><button class="btn btn-ghost btn-sm flex-fill" onclick="navigateTo('investments')">View Portfolio</button></div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Balance
   ============================================ */
function renderBalance() {
  return `
    <div class="page-title-row"><div><h1>Balance</h1><p>Detailed view of your account balances.</p></div></div>
    <div class="row g-3 mb-4">
      <div class="col-lg-8">
        <div class="balance-hero-card">
          <p class="balance-hero-card__label">Total Balance</p>
          <h2 class="balance-hero-card__amount">${formatCurrency(CUSTOMER.balance + 154200 + 123700)}</h2>
          <p class="text-muted-2" style="margin:0">Across all accounts</p>
          <div class="balance-hero-card__sub">
            <div class="balance-hero-card__sub-item"><small>Checking</small><span>${formatCurrency(CUSTOMER.balance)}</span></div>
            <div class="balance-hero-card__sub-item"><small>Savings</small><span>${formatCurrency(154200)}</span></div>
            <div class="balance-hero-card__sub-item"><small>Investments</small><span>${formatCurrency(123700)}</span></div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>Balance Trend</h3></div>
          <div class="chart-container-sm"><canvas id="balChart"></canvas></div>
        </div>
      </div>
    </div>
    <div class="glass-card widget-card">
      <div class="widget-card__header"><h3>Balance History</h3></div>
      <div class="chart-container"><canvas id="balChart2"></canvas></div>
    </div>
  `;
}

/* ============================================
   PAGE: Transactions
   ============================================ */
function renderTransactions() {
  const txns = myTransactions();
  return `
    <div class="page-title-row">
      <div><h1>Transactions</h1><p>All your account transactions.</p></div>
      <button class="btn btn-ghost btn-sm" onclick="showToast('Export','Transactions exported.','info')"><i class="bi bi-download me-1"></i> Export</button>
    </div>
    <div class="filter-bar">
      <div class="search-input"><i class="bi bi-search"></i><input type="text" class="form-control" placeholder="Search transactions..." id="txnSearch" /></div>
      <select class="form-select" id="txnType"><option value="">All Types</option><option>Deposit</option><option>Withdrawal</option><option>Payment</option></select>
      <select class="form-select"><option value="">All Dates</option><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select>
    </div>
    <div class="glass-card p-0">
      <div class="table-wrap">
        <table class="data-table" id="txnTable">
          <thead><tr><th>ID</th><th>Description</th><th>Type</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            ${txns.map(t => `
              <tr>
                <td><small>${t.id}</small></td>
                <td>${t.desc}</td>
                <td><span class="badge badge-${t.type==='Deposit'?'success':t.type==='Withdrawal'?'danger':'info'}">${t.type}</span></td>
                <td class="${t.type==='Deposit'?'text-success':'text-danger'}">${t.type==='Deposit'?'+':'-'}${formatCurrency(t.amount)}</td>
                <td><small>${t.method}</small></td>
                <td>${statusBadge(t.status)}</td>
                <td><small>${formatDate(t.date)}</small></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Fund Transfer
   ============================================ */
function renderTransfer() {
  return `
    <div class="page-title-row"><div><h1>Fund Transfer</h1><p>Send money to any account instantly.</p></div></div>
    <div class="row g-3">
      <div class="col-lg-7">
        <div class="glass-card p-4">
          <h4 class="mb-3">Transfer Details</h4>
          <form id="transferForm">
            <div class="form-group"><label class="form-label">From Account</label><select class="form-select"><option>Checking — ${formatCurrency(CUSTOMER.balance)}</option><option>Savings — ${formatCurrency(154200)}</option></select></div>
            <div class="form-group"><label class="form-label">Recipient Name</label><input type="text" class="form-control" placeholder="John Doe" required /></div>
            <div class="form-group"><label class="form-label">Recipient Account Number</label><input type="text" class="form-control" placeholder="1234567890" required /></div>
            <div class="form-group"><label class="form-label">Bank Name</label><input type="text" class="form-control" placeholder="Recipient's bank" required /></div>
            <div class="form-group"><label class="form-label">Amount</label><div class="input-group"><span class="input-group-text">$</span><input type="number" class="form-control" id="transferAmount" placeholder="0.00" required /></div></div>
            <div class="form-group"><label class="form-label">Description</label><input type="text" class="form-control" placeholder="What's this for?" /></div>
            <div class="form-check form-switch my-3"><input class="form-check-input" type="checkbox" id="instantTransfer" checked /><label class="form-check-label text-muted-2" for="instantTransfer">Instant transfer (free)</label></div>
            <button type="submit" class="btn btn-glow w-100 btn-lg">Review Transfer <i class="bi bi-arrow-right ms-1"></i></button>
          </form>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="glass-card p-4">
          <h4 class="mb-3">Recent Transfers</h4>
          ${myTransactions().filter(t=>t.type==='Transfer'||t.type==='Payment').slice(0,4).map(t=>`
            <div class="emi-item" style="margin:0 0 0.5rem">
              <div class="emi-item__info"><h4 style="font-size:0.85rem">${t.desc}</h4><small class="text-muted-2">${formatDate(t.date)}</small></div>
              <div class="emi-item__amount"><strong class="text-danger">-${formatCurrency(t.amount)}</strong></div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Deposit
   ============================================ */
function renderDeposit() {
  return `
    <div class="page-title-row"><div><h1>Deposit</h1><p>Add money to your account.</p></div></div>
    <div class="row g-3">
      <div class="col-lg-7">
        <div class="glass-card p-4">
          <h4 class="mb-3">Deposit Funds</h4>
          <form id="depositForm">
            <div class="form-group"><label class="form-label">To Account</label><select class="form-select"><option>Checking — ${formatCurrency(CUSTOMER.balance)}</option><option>Savings — ${formatCurrency(154200)}</option></select></div>
            <div class="form-group"><label class="form-label">Deposit Method</label><select class="form-select" id="depositMethod"><option>Wire Transfer</option><option>ACH</option><option>Check</option><option>Mobile Check Deposit</option><option>Cash</option></select></div>
            <div class="form-group"><label class="form-label">Amount</label><div class="input-group"><span class="input-group-text">$</span><input type="number" class="form-control" id="depositAmount" placeholder="0.00" required /></div></div>
            <div class="form-group"><label class="form-label">Description</label><input type="text" class="form-control" placeholder="Deposit description" /></div>
            <button type="submit" class="btn btn-success-glow w-100 btn-lg">Confirm Deposit <i class="bi bi-check-lg ms-1"></i></button>
          </form>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="glass-card p-4">
          <h4 class="mb-3">Recent Deposits</h4>
          ${myTransactions().filter(t=>t.type==='Deposit').slice(0,4).map(t=>`
            <div class="emi-item" style="margin:0 0 0.5rem">
              <div class="emi-item__info"><h4 style="font-size:0.85rem">${t.desc}</h4><small class="text-muted-2">${formatDate(t.date)}</small></div>
              <div class="emi-item__amount"><strong class="text-success">+${formatCurrency(t.amount)}</strong></div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Withdrawal
   ============================================ */
function renderWithdrawal() {
  return `
    <div class="page-title-row"><div><h1>Withdrawal</h1><p>Withdraw cash from your account.</p></div></div>
    <div class="row g-3">
      <div class="col-lg-7">
        <div class="glass-card p-4">
          <h4 class="mb-3">Withdraw Funds</h4>
          <form id="withdrawalForm">
            <div class="form-group"><label class="form-label">From Account</label><select class="form-select"><option>Checking — ${formatCurrency(CUSTOMER.balance)}</option><option>Savings — ${formatCurrency(154200)}</option></select></div>
            <div class="form-group"><label class="form-label">Withdrawal Method</label><select class="form-select"><option>ATM</option><option>Bank Teller</option><option>Wire Transfer</option><option>Online Transfer</option></select></div>
            <div class="form-group"><label class="form-label">Amount</label><div class="input-group"><span class="input-group-text">$</span><input type="number" class="form-control" id="withdrawalAmount" placeholder="0.00" required /></div></div>
            <div class="form-group"><label class="form-label">Description</label><input type="text" class="form-control" placeholder="Withdrawal description" /></div>
            <button type="submit" class="btn btn-glow w-100 btn-lg">Confirm Withdrawal <i class="bi bi-arrow-up ms-1"></i></button>
          </form>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="glass-card p-4">
          <h4 class="mb-3">Daily Limit</h4>
          <p class="text-muted-2 mb-2">ATM withdrawal limit</p>
          <h3 class="text-gradient">$3,000</h3>
          <div class="progress-thin my-3"><div class="progress-thin__bar" style="width:42%"></div></div>
          <small class="text-muted-2">$1,260 used today</small>
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Loan Details
   ============================================ */
function renderLoans() {
  const loans = myLoans();
  return `
    <div class="page-title-row">
      <div><h1>Loan Details</h1><p>Your active and past loans.</p></div>
      <a href="loans.html" class="btn btn-glow"><i class="bi bi-plus-circle me-1"></i> Apply for Loan</a>
    </div>
    ${loans.map(l => `
      <div class="glass-card widget-card mb-3">
        <div class="row align-items-center">
          <div class="col-md-3"><div class="loan-card__icon bg-primary-soft mb-2" style="width:48px;height:48px"><i class="bi bi-bank"></i></div><h4>${l.type}</h4><small class="text-muted-2">${l.id}</small></div>
          <div class="col-md-3"><small class="text-muted-2">Original Amount</small><h5>${formatCurrency(l.amount)}</h5></div>
          <div class="col-md-3"><small class="text-muted-2">Outstanding</small><h5 class="text-warning">${formatCurrency(l.remaining)}</h5></div>
          <div class="col-md-3"><small class="text-muted-2">Interest Rate</small><h5>${l.rate}%</h5></div>
        </div>
        <hr style="border-color:var(--border-glass)">
        <div class="row">
          <div class="col-md-3"><small class="text-muted-2">Monthly EMI</small><h5 class="text-success">${formatCurrency(l.emi)}</h5></div>
          <div class="col-md-3"><small class="text-muted-2">Term</small><h5>${l.term} months</h5></div>
          <div class="col-md-3"><small class="text-muted-2">Next Due</small><h5>${formatDate(l.nextDue)}</h5></div>
          <div class="col-md-3"><small class="text-muted-2">Status</small><h5>${statusBadge(l.status)}</h5></div>
        </div>
        <div class="mt-3">
          <small class="text-muted-2">Progress: ${Math.round((l.amount - l.remaining) / l.amount * 100)}% paid off</small>
          <div class="progress-thin mt-1"><div class="progress-thin__bar" style="width:${(l.amount - l.remaining) / l.amount * 100}%;background:var(--nb-grad-success)"></div></div>
        </div>
      </div>`).join('')}
  `;
}

/* ============================================
   PAGE: EMI Schedule
   ============================================ */
function renderEmi() {
  const loans = myLoans();
  const loan = loans[0];
  if (!loan) return `<div class="page-title-row"><div><h1>EMI Schedule</h1></div></div><div class="empty-state"><i class="bi bi-calendar-check"></i><p>No active loans with EMI schedule.</p></div>`;
  const months = ['Sep 2026','Oct 2026','Nov 2026','Dec 2026','Jan 2027','Feb 2027','Mar 2027','Apr 2027','May 2027','Jun 2027','Jul 2027','Aug 2027'];
  return `
    <div class="page-title-row"><div><h1>EMI Schedule</h1><p>Your upcoming monthly payments.</p></div></div>
    <div class="row g-3 mb-4">
      <div class="col-sm-4"><div class="glass-card p-3 text-center"><small class="text-muted-2">Monthly EMI</small><h3 class="text-gradient">${formatCurrency(loan.emi)}</h3></div></div>
      <div class="col-sm-4"><div class="glass-card p-3 text-center"><small class="text-muted-2">Next Due Date</small><h3 class="text-gradient">${formatDate(loan.nextDue)}</h3></div></div>
      <div class="col-sm-4"><div class="glass-card p-3 text-center"><small class="text-muted-2">Remaining EMIs</small><h3 class="text-gradient">${Math.ceil(loan.remaining / loan.emi)}</h3></div></div>
    </div>
    <div class="glass-card p-0">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>#</th><th>Month</th><th>EMI Amount</th><th>Principal</th><th>Interest</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>
            ${months.map((m, i) => {
              const interest = Math.round(loan.remaining * loan.rate / 100 / 12);
              const principal = loan.emi - interest;
              const balance = loan.remaining - (principal * (i + 1));
              return `<tr><td>${i + 1}</td><td>${m}</td><td>${formatCurrency(loan.emi)}</td><td>${formatCurrency(principal)}</td><td>${formatCurrency(interest)}</td><td>${formatCurrency(Math.max(balance, 0))}</td><td>${i === 0 ? '<span class="badge badge-warning">Due Soon</span>' : '<span class="badge badge-secondary">Upcoming</span>'}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Cards
   ============================================ */
function renderCards() {
  const cards = myCards();
  return `
    <div class="page-title-row">
      <div><h1>My Cards</h1><p>Manage your debit and credit cards.</p></div>
      <a href="cards.html" class="btn btn-glow"><i class="bi bi-plus-circle me-1"></i> Apply for Card</a>
    </div>
    <div class="row g-3">
      ${cards.map(c => `
        <div class="col-md-6 col-lg-6">
          <div class="card-display card-display--${c.color} mb-3">
            <div class="card-display__top"><div class="card-display__type">${c.type}</div><i class="bi bi-wifi" style="font-size:1.2rem;transform:rotate(90deg)"></i></div>
            <div class="card-display__chip"></div>
            <div class="card-display__number">${c.number}</div>
            <div class="card-display__bottom"><div><div class="card-display__name">${c.customer}</div><small style="opacity:0.6">${c.expiry}</small></div><div class="card-display__brand">${c.type.includes('Visa')?'VISA':'MC'}</div></div>
          </div>

        </div>`).join('')}
    </div>
  `;
}

/* ============================================
   PAGE: Investments
   ============================================ */
function renderInvestments() {
  const investments = store.getInvestments();
  const totalValue = investments.reduce((s, i) => s + i.value, 0);
  return `
    <div class="page-title-row">
      <div><h1>Investments</h1><p>Your investment portfolio.</p></div>
      <a href="investments.html" class="btn btn-glow"><i class="bi bi-graph-up me-1"></i> Invest More</a>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-sm-4"><div class="glass-card p-3 text-center"><small class="text-muted-2">Total Value</small><h3 class="text-gradient">${formatCurrency(totalValue)}</h3></div></div>
      <div class="col-sm-4"><div class="glass-card p-3 text-center"><small class="text-muted-2">Total Return</small><h3 class="text-success">+14.2%</h3></div></div>
      <div class="col-sm-4"><div class="glass-card p-3 text-center"><small class="text-muted-2">This Month</small><h3 class="text-success">+3.4%</h3></div></div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-lg-8"><div class="glass-card widget-card"><div class="widget-card__header"><h3>Portfolio Performance</h3></div><div class="chart-container"><canvas id="invChart"></canvas></div></div></div>
      <div class="col-lg-4"><div class="glass-card widget-card"><div class="widget-card__header"><h3>Allocation</h3></div><div class="chart-container"><canvas id="invChart2"></canvas></div></div></div>
    </div>
    <div class="row g-3">
      ${investments.map(inv => `
        <div class="col-md-6 col-lg-3">
          <div class="glass-card investment-card">
            <div class="investment-card__header"><div class="investment-card__icon bg-${inv.color}-soft"><i class="bi bi-graph-up"></i></div><span class="badge badge-${inv.change>=0?'success':'danger'}">${inv.change>=0?'+':''}${inv.change}%</span></div>
            <h4>${inv.name}</h4><p class="investment-card__value">${formatCurrency(inv.value)}</p><small class="text-muted-2">${inv.shares} shares &middot; ${inv.symbol}</small>
          </div>
        </div>`).join('')}
    </div>
  `;
}

/* ============================================
   PAGE: Payment History
   ============================================ */
function renderPayments() {
  const payments = myTransactions().filter(t => t.type === 'Payment' || t.type === 'Transfer');
  return `
    <div class="page-title-row"><div><h1>Payment History</h1><p>All your payments and transfers.</p></div></div>
    <div class="glass-card p-0">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Description</th><th>Type</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            ${payments.map(p => `
              <tr>
                <td><small>${p.id}</small></td>
                <td>${p.desc}</td>
                <td>${p.type}</td>
                <td class="text-danger">-${formatCurrency(p.amount)}</td>
                <td><small>${p.method}</small></td>
                <td>${statusBadge(p.status)}</td>
                <td><small>${formatDate(p.date)}</small></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Notifications
   ============================================ */
function renderNotifications() {
  const notifs = store.getNotifications();
  return `
    <div class="page-title-row">
      <div><h1>Notifications</h1><p>Your alerts and updates.</p></div>
      <button class="btn btn-ghost btn-sm" onclick="markAllRead()"><i class="bi bi-check2-all me-1"></i> Mark all read</button>
    </div>
    <div class="glass-card p-3">
      ${notifs.map(n => `
        <div class="notification-item ${n.read?'':'unread'}">
          <div class="notification-item__icon bg-${n.color}-soft"><i class="bi ${n.icon}"></i></div>
          <div class="notification-item__body"><h4>${n.title}</h4><p>${n.desc}</p><small>${n.time}</small></div>
        </div>`).join('')}
    </div>
  `;
}

window.markAllRead = function() {
  const notifs = store.getNotifications().map(n => ({ ...n, read: true }));
  store.setNotifications(notifs);
  renderPage('notifications');
  showToast('Done', 'All notifications marked as read.', 'success');
};

/* ============================================
   PAGE: Profile
   ============================================ */
function renderProfile() {
  return `
    <div class="page-title-row"><div><h1>Profile</h1><p>Your personal information.</p></div></div>
    <div class="glass-card profile-header mb-4">
      <div class="profile-header__avatar">SK</div>
      <div class="profile-header__info"><h2>${CUSTOMER.name}</h2><p>${CUSTOMER.email}</p><div class="mt-2"><span class="badge badge-success">Active</span> <span class="badge badge-primary">Premium</span></div></div>
    </div>
    <div class="row g-3">
      <div class="col-lg-6">
        <div class="glass-card p-4">
          <h3 class="mb-3">Personal Information</h3>
          <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control" value="${CUSTOMER.name}" /></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" value="${CUSTOMER.email}" /></div>
          <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-control" value="+1 555-0101" /></div>
          <div class="form-group"><label class="form-label">Address</label><input type="text" class="form-control" value="123 Main St, San Francisco, CA" /></div>
          <button class="btn btn-glow" onclick="showToast('Profile Updated','Your profile has been saved.','success')">Update Profile</button>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="glass-card p-4">
          <h3 class="mb-3">Security</h3>
          <div class="form-group"><label class="form-label">Current Password</label><input type="password" class="form-control" placeholder="Enter current password" /></div>
          <div class="form-group"><label class="form-label">New Password</label><input type="password" class="form-control" placeholder="Enter new password" /></div>
          <div class="form-group"><label class="form-label">Confirm Password</label><input type="password" class="form-control" placeholder="Re-enter new password" /></div>
          <div class="form-check form-switch my-3"><input class="form-check-input" type="checkbox" id="twoFa" checked /><label class="form-check-label text-muted-2" for="twoFa">Enable two-factor authentication</label></div>
          <button class="btn btn-glow" onclick="showToast('Password Changed','Your password has been updated.','success')">Change Password</button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Settings
   ============================================ */
window.switchSettingsTab = function(tab) {
  document.querySelectorAll('.settings-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  
  const contentEl = document.getElementById('settingsContent');
  if (!contentEl) return;
  
  let html = '';
  if (tab === 'notifications') {
    html = `
      <h3 class="mb-4">Notification Preferences</h3>
      ${['Transaction alerts','Deposit notifications','Withdrawal alerts','Loan EMI reminders','Card payment due','Investment updates','Security alerts','Promotional offers'].map(label => `
        <div class="d-flex justify-content-between align-items-center py-2" style="border-bottom:var(--border-glass)">
          <span>${label}</span>
          <div class="form-check form-switch"><input class="form-check-input" type="checkbox" checked /></div>
        </div>`).join('')}
      <div class="d-flex justify-content-between align-items-center py-2">
        <span>Email notifications</span>
        <div class="form-check form-switch"><input class="form-check-input" type="checkbox" checked /></div>
      </div>
      <div class="d-flex justify-content-between align-items-center py-2">
        <span>SMS notifications</span>
        <div class="form-check form-switch"><input class="form-check-input" type="checkbox" /></div>
      </div>
      <button class="btn btn-glow mt-3" onclick="showToast('Settings Saved','Your preferences have been saved.','success')">Save Preferences</button>
    `;
  } else if (tab === 'security') {
    html = `
      <h3 class="mb-4">Security Settings</h3>
      <div class="mb-4">
        <h5>Change Password</h5>
        <div class="mb-3"><input type="password" class="form-control" placeholder="Current Password"></div>
        <div class="mb-3"><input type="password" class="form-control" placeholder="New Password"></div>
        <div class="mb-3"><input type="password" class="form-control" placeholder="Confirm New Password"></div>
        <button class="btn btn-glow" onclick="showToast('Password Updated','Your password was changed successfully.','success')">Update Password</button>
      </div>
      <div class="d-flex justify-content-between align-items-center py-3" style="border-top:var(--border-glass)">
        <div>
          <h5>Two-Factor Authentication (2FA)</h5>
          <p class="text-muted-2 mb-0">Secure your account with an extra layer of security.</p>
        </div>
        <div class="form-check form-switch"><input class="form-check-input" type="checkbox" /></div>
      </div>
    `;
  } else if (tab === 'appearance') {
    html = `
      <h3 class="mb-4">Appearance Settings</h3>
      <div class="d-flex justify-content-between align-items-center py-3">
        <div>
          <h5>Dark Mode</h5>
          <p class="text-muted-2 mb-0">Switch between light and dark themes.</p>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="darkModeToggle" ${document.documentElement.getAttribute('data-theme') !== 'light' ? 'checked' : ''} onchange="document.getElementById('themeToggle').click()" />
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center py-3" style="border-top:var(--border-glass)">
        <div>
          <h5>Compact Mode</h5>
          <p class="text-muted-2 mb-0">Reduce spacing for a denser layout.</p>
        </div>
        <div class="form-check form-switch"><input class="form-check-input" type="checkbox" /></div>
      </div>
    `;
  } else if (tab === 'language') {
    html = `
      <h3 class="mb-4">Language & Region</h3>
      <div class="mb-3">
        <label class="form-label">Language</label>
        <select class="form-select">
          <option>English (US)</option>
          <option>English (UK)</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Timezone</label>
        <select class="form-select">
          <option>UTC-05:00 Eastern Time</option>
          <option>UTC-08:00 Pacific Time</option>
          <option>UTC+00:00 GMT</option>
        </select>
      </div>
      <button class="btn btn-glow mt-2" onclick="showToast('Language Updated','Language settings saved.','success')">Save Changes</button>
    `;
  } else if (tab === 'privacy') {
    html = `
      <h3 class="mb-4">Privacy Settings</h3>
      <div class="d-flex justify-content-between align-items-center py-3">
        <div>
          <h5>Profile Visibility</h5>
          <p class="text-muted-2 mb-0">Allow others to find your profile by email.</p>
        </div>
        <div class="form-check form-switch"><input class="form-check-input" type="checkbox" checked /></div>
      </div>
      <div class="d-flex justify-content-between align-items-center py-3" style="border-top:var(--border-glass)">
        <div>
          <h5>Data Sharing</h5>
          <p class="text-muted-2 mb-0">Share usage data to help us improve Stackly.</p>
        </div>
        <div class="form-check form-switch"><input class="form-check-input" type="checkbox" /></div>
      </div>
      <button class="btn btn-glow mt-3" onclick="showToast('Privacy Updated','Privacy preferences saved.','success')">Save Privacy</button>
    `;
  }
  contentEl.innerHTML = html;
};

function renderSettings() {
  setTimeout(() => window.switchSettingsTab('notifications'), 0);
  return `
    <div class="page-title-row"><div><h1>Settings</h1><p>Manage your preferences.</p></div></div>
    <div class="row g-3">
      <div class="col-lg-4">
        <div class="glass-card p-3">
          <div class="settings-nav">
            <div class="settings-nav-item active" data-tab="notifications" onclick="window.switchSettingsTab('notifications')"><i class="bi bi-bell"></i> Notifications</div>
            <div class="settings-nav-item" data-tab="security" onclick="window.switchSettingsTab('security')"><i class="bi bi-shield-lock"></i> Security</div>
            <div class="settings-nav-item" data-tab="appearance" onclick="window.switchSettingsTab('appearance')"><i class="bi bi-display"></i> Appearance</div>
            <div class="settings-nav-item" data-tab="language" onclick="window.switchSettingsTab('language')"><i class="bi bi-globe2"></i> Language</div>
            <div class="settings-nav-item" data-tab="privacy" onclick="window.switchSettingsTab('privacy')"><i class="bi bi-lock"></i> Privacy</div>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="glass-card p-4" id="settingsContent">
          <!-- Content injected via switchSettingsTab -->
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   CHARTS
   ============================================ */
function initCharts(page) {
  const theme = chartTheme();
  const grid = theme.grid;
  const ticks = theme.ticks;

  if (page === 'overview') {
    const ctx1 = document.getElementById('ovChart1');
    if (ctx1) {
      charts.o1 = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: ['Mar','Apr','May','Jun','Jul','Aug'],
          datasets: [
            { label: 'Income', data: [4200,4800,5100,5500,5800,6200], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
            { label: 'Expense', data: [1800,2100,1900,2400,2200,2000], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: ticks } } }, scales: { x: { grid: { color: grid }, ticks: { color: ticks } }, y: { grid: { color: grid }, ticks: { color: ticks } } } }
      });
    }
    const ctx2 = document.getElementById('ovChart2');
    if (ctx2) {
      charts.o2 = new Chart(ctx2, {
        type: 'doughnut',
        data: { labels: ['Income','Expense','Savings'], datasets: [{ data: [60,25,15], backgroundColor: ['#10b981','#ef4444','#2563eb'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: ticks } } } }
      });
    }
  }

  if (page === 'balance') {
    const ctx1 = document.getElementById('balChart');
    if (ctx1) {
      charts.b1 = new Chart(ctx1, {
        type: 'line',
        data: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'], datasets: [{ label: 'Balance', data: [850000,860000,830000,870000,890000,920000,860000,847250], borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: grid }, ticks: { color: ticks } }, y: { grid: { color: grid }, ticks: { color: ticks } } } }
      });
    }
    const ctx2 = document.getElementById('balChart2');
    if (ctx2) {
      charts.b2 = new Chart(ctx2, {
        type: 'bar',
        data: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'], datasets: [{ label: 'Checking', data: [850000,860000,830000,870000,890000,920000,860000,847250], backgroundColor: '#2563eb', borderRadius: 6 },{ label: 'Savings', data: [120000,125000,130000,135000,140000,148000,152000,154200], backgroundColor: '#10b981', borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: ticks } } }, scales: { x: { grid: { color: grid }, ticks: { color: ticks } }, y: { grid: { color: grid }, ticks: { color: ticks } } } }
      });
    }
  }

  if (page === 'investments') {
    const ctx1 = document.getElementById('invChart');
    if (ctx1) {
      charts.i1 = new Chart(ctx1, {
        type: 'line',
        data: { labels: ['Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'], datasets: [{ label: 'Portfolio Value', data: [75000,78000,82000,85000,91000,89000,95000,102000,108000,112000,118000,123700], borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: grid }, ticks: { color: ticks } }, y: { grid: { color: grid }, ticks: { color: ticks } } } }
      });
    }
    const ctx2 = document.getElementById('invChart2');
    if (ctx2) {
      charts.i2 = new Chart(ctx2, {
        type: 'doughnut',
        data: { labels: ['Stocks','ETFs','Bonds','Cash'], datasets: [{ data: [45,30,15,10], backgroundColor: ['#2563eb','#10b981','#22d3ee','#f5b942'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: ticks } } } }
      });
    }
  }
}

/* ============================================
   PAGE EVENTS
   ============================================ */
function initPageEvents(page) {
  if (['overview','balance','investments'].includes(page)) {
    setTimeout(() => initCharts(page), 50);
  }
  if (page === 'transactions') {
    const search = document.getElementById('txnSearch');
    if (search) search.addEventListener('input', () => {
      const val = search.value.toLowerCase();
      document.querySelectorAll('#txnTable tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
      });
    });
  }
  if (page === 'transfer') {
    document.getElementById('transferForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const amt = parseFloat(document.getElementById('transferAmount').value);
      if (!amt || amt <= 0) { showToast('Error', 'Please enter a valid amount.', 'error'); return; }
      if (amt > CUSTOMER.balance) { showToast('Insufficient Funds', 'You do not have enough balance for this transfer.', 'error'); return; }
      showTransferConfirm(amt);
    });
  }
  if (page === 'deposit') {
    document.getElementById('depositForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const amt = parseFloat(document.getElementById('depositAmount').value);
      if (!amt || amt <= 0) { showToast('Error', 'Please enter a valid amount.', 'error'); return; }
      CUSTOMER.balance += amt;
      showToast('Deposit Successful', `${formatCurrency(amt)} has been deposited to your account.`, 'success');
      e.target.reset();
      setTimeout(() => renderPage('overview'), 800);
    });
  }
  if (page === 'withdrawal') {
    document.getElementById('withdrawalForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const amt = parseFloat(document.getElementById('withdrawalAmount').value);
      if (!amt || amt <= 0) { showToast('Error', 'Please enter a valid amount.', 'error'); return; }
      if (amt > CUSTOMER.balance) { showToast('Insufficient Funds', 'You do not have enough balance for this withdrawal.', 'error'); return; }
      CUSTOMER.balance -= amt;
      showToast('Withdrawal Successful', `${formatCurrency(amt)} has been withdrawn from your account.`, 'success');
      e.target.reset();
      setTimeout(() => renderPage('overview'), 800);
    });
  }
}

/* ---- Transfer confirmation modal ---- */
function showTransferConfirm(amt) {
  const modalEl = document.getElementById('actionModal');
  document.getElementById('actionModalTitle').textContent = 'Confirm Transfer';
  document.getElementById('actionModalBody').innerHTML = `
    <div class="text-center py-3">
      <i class="bi bi-send-check text-gradient" style="font-size:3rem"></i>
      <h4 class="mt-3">Confirm Your Transfer</h4>
      <p class="text-muted-2">You are about to send <strong class="text-gradient" style="font-size:1.5rem">${formatCurrency(amt)}</strong></p>
      <p class="text-muted-2">This action cannot be undone.</p>
    </div>`;
  document.getElementById('actionModalFooter').innerHTML = `
    <button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button>
    <button class="btn btn-glow" onclick="confirmTransfer(${amt})"><i class="bi bi-check-lg me-1"></i> Confirm Transfer</button>`;
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

window.confirmTransfer = function(amt) {
  CUSTOMER.balance -= amt;
  closeModal();
  showToast('Transfer Successful', `${formatCurrency(amt)} sent successfully.`, 'success');
  setTimeout(() => { document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.page === 'overview')); currentPage = 'overview'; renderPage('overview'); }, 800);
};

window.navigateTo = function(page) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  currentPage = page;
  renderPage(page);
};

window.closeModal = function() {
  const modalEl = document.getElementById('actionModal');
  bootstrap.Modal.getOrCreateInstance(modalEl).hide();
};

/* ============================================
   INIT
   ============================================ */
function initCustomer() {
  initSidebar();
  initThemeToggle();
  initNotifBtn();
  
  // Update sidebar user info dynamically
  const avatarEl = document.querySelector('.sidebar-user__avatar');
  const nameEl = document.querySelector('.sidebar-user__info strong');
  if (avatarEl) avatarEl.textContent = CUSTOMER.avatar;
  if (nameEl) nameEl.textContent = CUSTOMER.name;

  if (typeof navigateTo === 'function') {
    navigateTo('overview');
  } else {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.page === 'overview'));
    currentPage = 'overview';
    renderPage('overview');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomer);
} else {
  initCustomer();
}

