/* ============================================
   Stackly — Admin Dashboard JS
   ============================================
   Renders all admin pages dynamically:
   Dashboard, Customers, Accounts, Transactions,
   Deposits, Withdrawals, Loans, Payments, Cards,
   Investments, Reports, Notifications, Settings, Profile
   ============================================ */




/* ---- Global state ---- */
const charts = {};
let currentPage = 'dashboard';

const session = typeof store !== 'undefined' ? store.getSession() : null;
const sessionName = session && session.name ? session.name : 'Admin User';
const firstName = sessionName.split(' ')[0];
const avatarInitials = sessionName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

const ADMIN = {
  name: sessionName,
  firstName: firstName,
  avatar: avatarInitials
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

/* ---- Sidebar / navigation ---- */
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
        navigateTo('dashboard');
      }
    });
  }
}

/* ---- Theme toggle (dashboard specific) ---- */
function initThemeToggle() {
  document.documentElement.setAttribute('data-theme', 'light');
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.style.display = 'none';
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
    dashboard: renderDashboard,
    customers: renderCustomers,
    accounts: renderAccounts,
    transactions: renderTransactions,
    deposits: renderDeposits,
    withdrawals: renderWithdrawals,
    loans: renderLoans,
    payments: renderPayments,
    cards: renderCards,
    investments: renderInvestments,
    reports: renderReports,
    notifications: renderNotifications,
    settings: renderSettings,
    profile: renderProfile,
  };

  const fn = pages[page] || pages.dashboard;
  content.innerHTML = fn();
  initPageEvents(page);
}

/* ---- Helper: metric card ---- */
function metricCard(icon, iconBg, label, value, change, changeDir) {
  const dirClass = changeDir === 'up' ? 'up' : 'down';
  const arrow = changeDir === 'up' ? 'bi-arrow-up' : 'bi-arrow-down';
  return `
    <div class="glass-card metric-card">
      <div class="metric-card__icon ${iconBg}"><i class="bi ${icon}"></i></div>
      <div class="metric-card__body">
        <p class="metric-card__label">${label}</p>
        <h3 class="metric-card__value">${value}</h3>
        <span class="metric-card__change ${dirClass}"><i class="bi ${arrow}"></i> ${change}</span>
      </div>
    </div>`;
}

/* ---- Helper: status badge ---- */
function statusBadge(status) {
  const map = { active: 'success', completed: 'success', pending: 'warning', inactive: 'secondary', failed: 'danger', frozen: 'warning' };
  return `<span class="badge badge-${map[status] || 'secondary'}">${status}</span>`;
}

/* ---- Helper: avatar ---- */
function avatarBg(name) {
  const colors = ['bg-grad-primary', 'bg-grad-success', 'bg-grad-info'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/* ============================================
   PAGE: Dashboard
   ============================================ */
function renderDashboard() {
  const customers = store.getCustomers();
  const transactions = store.getTransactions();
  const loans = store.getLoans();
  const totalDeposits = transactions.filter(t => t.type === 'Deposit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'Withdrawal' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalVolume = transactions.reduce((s, t) => s + t.amount, 0);
  const totalRevenue = Math.round(totalVolume * 0.015);
  const activeAccounts = customers.filter(c => c.status === 'active').length;

  const recentTxns = transactions.slice(0, 6);

  return `
    <div class="page-title-row">
      <div><h1>Dashboard</h1><p>Welcome back, ${ADMIN.firstName}. Here's your bank overview.</p></div>
      <button class="btn btn-glow" onclick="openModal('generateReport')"><i class="bi bi-file-earmark-bar-graph me-1"></i> Generate Report</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-lg-3">${metricCard('bi-people', 'bg-primary-soft', 'Total Customers', formatCurrency(customers.length * 1000).replace('$', ''), '12.5%', 'up')}</div>
      <div class="col-sm-6 col-lg-3">${metricCard('bi-cash-stack', 'bg-success-soft', 'Total Deposits', formatCurrency(totalDeposits + 5000000), '8.2%', 'up')}</div>
      <div class="col-sm-6 col-lg-3">${metricCard('bi-arrow-up-circle', 'bg-danger-soft', 'Total Withdrawals', formatCurrency(totalWithdrawals + 1200000), '3.1%', 'down')}</div>
      <div class="col-sm-6 col-lg-3">${metricCard('bi-wallet2', 'bg-info-soft', 'Active Accounts', formatCurrency(activeAccounts * 1000).replace('$', ''), '5.4%', 'up')}</div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-lg-3">${metricCard('bi-bank', 'bg-warning-soft', 'Active Loans', formatCurrency(loans.filter(l => l.status === 'active').length * 1000).replace('$', ''), '2.1%', 'up')}</div>
      <div class="col-sm-6 col-lg-3">${metricCard('bi-arrow-left-right', 'bg-primary-soft', 'Transaction Volume', formatCurrency(totalVolume + 15000000), '15.7%', 'up')}</div>
      <div class="col-sm-6 col-lg-3">${metricCard('bi-graph-up', 'bg-success-soft', 'Revenue', formatCurrency(totalRevenue + 225000), '9.8%', 'up')}</div>
      <div class="col-sm-6 col-lg-3">${metricCard('bi-credit-card-2-front', 'bg-info-soft', 'Cards Issued', formatCurrency(store.getCards().length * 1000).replace('$', ''), '4.2%', 'up')}</div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-lg-8">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>Financial Analytics</h3><span class="badge badge-info">Last 12 months</span></div>
          <div class="chart-container"><canvas id="dashChart1"></canvas></div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>Transaction Types</h3></div>
          <div class="chart-container"><canvas id="dashChart2"></canvas></div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-8">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>Recent Transactions</h3><a class="sidebar-link" style="cursor:pointer;font-size:0.8rem" onclick="navigateTo('transactions')">View all <i class="bi bi-arrow-right"></i></a></div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Customer</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                ${recentTxns.map(t => `
                  <tr>
                    <td><small>${t.id}</small></td>
                    <td><div class="table-avatar"><div class="table-avatar__img ${avatarBg(t.customer)}">${t.customer.split(' ').map(n=>n[0]).join('')}</div><div class="table-avatar__info"><strong>${t.customer}</strong></div></div></td>
                    <td>${t.type}</td>
                    <td>${formatCurrency(t.amount)}</td>
                    <td>${statusBadge(t.status)}</td>
                    <td><small>${formatDate(t.date)}</small></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-lg-4 d-flex flex-column gap-3">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>Customer Activity</h3></div>
          <div class="chart-container"><canvas id="dashChart3"></canvas></div>
        </div>
        <div class="glass-card widget-card flex-fill">
          <div class="widget-card__header"><h3>System Status</h3></div>
          <ul class="list-unstyled mb-0 mt-3">
            <li class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary" style="border-color: rgba(255,255,255,0.05)!important">
              <div class="d-flex align-items-center"><i class="bi bi-server text-success me-2"></i><span class="text-muted-2">Core Banking API</span></div>
              <span class="badge badge-success">Online</span>
            </li>
            <li class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary" style="border-color: rgba(255,255,255,0.05)!important">
              <div class="d-flex align-items-center"><i class="bi bi-credit-card text-success me-2"></i><span class="text-muted-2">Payment Gateway</span></div>
              <span class="badge badge-success">Online</span>
            </li>
            <li class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary" style="border-color: rgba(255,255,255,0.05)!important">
              <div class="d-flex align-items-center"><i class="bi bi-shield-check text-success me-2"></i><span class="text-muted-2">Security Module</span></div>
              <span class="badge badge-success">Online</span>
            </li>
            <li class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center"><i class="bi bi-exclamation-triangle text-warning me-2"></i><span class="text-muted-2">Fraud Engine</span></div>
              <span class="badge badge-warning">Degraded</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Customers
   ============================================ */
function renderCustomers() {
  const customers = store.getCustomers();
  return `
    <div class="page-title-row">
      <div><h1>Customer Management</h1><p>View, add and manage all bank customers.</p></div>
      <button class="btn btn-glow" onclick="openModal('addCustomer')"><i class="bi bi-person-plus me-1"></i> Add Customer</button>
    </div>
    <div class="filter-bar">
      <div class="search-input"><i class="bi bi-search"></i><input type="text" class="form-control" id="custSearch" placeholder="Search customers..." /></div>
      <select class="form-select" id="custFilterType"><option value="">All Types</option><option>Personal</option><option>Business</option><option>Premium</option></select>
      <select class="form-select" id="custFilterStatus"><option value="">All Status</option><option>active</option><option>pending</option><option>inactive</option></select>
    </div>
    <div class="glass-card p-0">
      <div class="table-wrap">
        <table class="data-table" id="custTable">
          <thead><tr><th>ID</th><th>Customer</th><th>Type</th><th>Phone</th><th>Balance</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            ${customers.map(c => `
              <tr>
                <td><small>${c.id}</small></td>
                <td><div class="table-avatar"><div class="table-avatar__img ${avatarBg(c.name)}">${c.avatar}</div><div class="table-avatar__info"><strong>${c.name}</strong><small>${c.email}</small></div></div></td>
                <td><span class="badge badge-primary">${c.type}</span></td>
                <td><small>${c.phone}</small></td>
                <td>${formatCurrency(c.balance)}</td>
                <td>${statusBadge(c.status)}</td>
                <td><small>${formatDate(c.joined)}</small></td>
                <td>
                  <button class="btn btn-ghost btn-sm" onclick="openModal('viewCustomer','${c.id}')"><i class="bi bi-eye"></i></button>
                  <button class="btn btn-ghost btn-sm" onclick="openModal('editCustomer','${c.id}')"><i class="bi bi-pencil"></i></button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Accounts
   ============================================ */
function renderAccounts() {
  const customers = store.getCustomers();
  return `
    <div class="page-title-row">
      <div><h1>Account Management</h1><p>Manage all customer bank accounts.</p></div>
      <button class="btn btn-glow" onclick="openModal('addAccount')"><i class="bi bi-plus-circle me-1"></i> New Account</button>
    </div>
    <div class="row g-3">
      ${customers.map(c => `
        <div class="col-md-6 col-lg-4">
          <div class="glass-card account-card">
            <div class="account-card__header">
              <div class="account-card__type">
                <div class="account-card__type-icon bg-primary-soft"><i class="bi bi-wallet2"></i></div>
                <div><strong>${c.type}</strong><div class="account-card__num">ACC-${c.id.split('-')[1]}</div></div>
              </div>
              ${statusBadge(c.status)}
            </div>
            <p class="account-card__balance">${formatCurrency(c.balance)}</p>
            <small class="text-muted-2">Holder: ${c.name}</small>
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-ghost btn-sm flex-fill" onclick="openModal('viewAccount','${c.id}')">Details</button>
              <button class="btn btn-ghost btn-sm" onclick="openModal('editAccount','${c.id}')"><i class="bi bi-pencil"></i></button>
            </div>
          </div>
        </div>`).join('')}
    </div>
  `;
}

/* ============================================
   PAGE: Transactions
   ============================================ */
function renderTransactions() {
  const transactions = store.getTransactions();
  return `
    <div class="page-title-row">
      <div><h1>Transactions</h1><p>All bank transactions in one place.</p></div>
      <button class="btn btn-glow" onclick="openModal('addTransaction')"><i class="bi bi-plus-circle me-1"></i> New Transaction</button>
    </div>
    <div class="filter-bar">
      <div class="search-input"><i class="bi bi-search"></i><input type="text" class="form-control" placeholder="Search transactions..." /></div>
      <select class="form-select"><option value="">All Types</option><option>Deposit</option><option>Withdrawal</option><option>Transfer</option><option>Payment</option></select>
      <select class="form-select"><option value="">All Status</option><option>completed</option><option>pending</option><option>failed</option></select>
      <button class="btn btn-ghost btn-sm"><i class="bi bi-download me-1"></i> Export</button>
    </div>
    <div class="glass-card p-0">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Account</th><th>Type</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td><small>${t.id}</small></td>
                <td>${t.customer}</td>
                <td><small>${t.accountId}</small></td>
                <td><span class="badge badge-${t.type === 'Deposit' ? 'success' : t.type === 'Withdrawal' ? 'danger' : 'info'}">${t.type}</span></td>
                <td>${formatCurrency(t.amount)}</td>
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
   PAGE: Deposits
   ============================================ */
function renderDeposits() {
  const deposits = store.getTransactions().filter(t => t.type === 'Deposit');
  const total = deposits.reduce((s, t) => s + t.amount, 0);
  return `
    <div class="page-title-row">
      <div><h1>Deposits</h1><p>Manage and track all incoming deposits.</p></div>
      <button class="btn btn-glow" onclick="openModal('addDeposit')"><i class="bi bi-plus-circle me-1"></i> Record Deposit</button>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-sm-4">${metricCard('bi-arrow-down-circle', 'bg-success-soft', 'Total Deposits', formatCurrency(total + 5000000), '8.2%', 'up')}</div>
      <div class="col-sm-4">${metricCard('bi-clock', 'bg-warning-soft', 'Pending', formatCurrency(deposits.filter(d=>d.status==='pending').reduce((s,t)=>s+t.amount,0)), '1.1%', 'up')}</div>
      <div class="col-sm-4">${metricCard('bi-check-circle', 'bg-info-soft', 'Completed', formatCurrency(deposits.filter(d=>d.status==='completed').reduce((s,t)=>s+t.amount,0)), '10.3%', 'up')}</div>
    </div>
    <div class="glass-card p-0">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            ${deposits.map(d => `
              <tr>
                <td><small>${d.id}</small></td>
                <td>${d.customer}</td>
                <td class="text-success">${formatCurrency(d.amount)}</td>
                <td><small>${d.method}</small></td>
                <td>${statusBadge(d.status)}</td>
                <td><small>${formatDate(d.date)}</small></td>
                <td><button class="btn btn-ghost btn-sm" onclick="openModal('viewDeposit','${d.id}')"><i class="bi bi-eye"></i></button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Withdrawals
   ============================================ */
function renderWithdrawals() {
  const withdrawals = store.getTransactions().filter(t => t.type === 'Withdrawal');
  const total = withdrawals.reduce((s, t) => s + t.amount, 0);
  return `
    <div class="page-title-row">
      <div><h1>Withdrawals</h1><p>Track all withdrawal requests and approvals.</p></div>
      <button class="btn btn-glow" onclick="openModal('addWithdrawal')"><i class="bi bi-plus-circle me-1"></i> Record Withdrawal</button>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-sm-4">${metricCard('bi-arrow-up-circle', 'bg-danger-soft', 'Total Withdrawals', formatCurrency(total + 1200000), '3.1%', 'down')}</div>
      <div class="col-sm-4">${metricCard('bi-clock', 'bg-warning-soft', 'Pending', '0', '0%', 'up')}</div>
      <div class="col-sm-4">${metricCard('bi-check-circle', 'bg-info-soft', 'Completed', formatCurrency(total), '5.7%', 'up')}</div>
    </div>
    <div class="glass-card p-0">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            ${withdrawals.map(w => `
              <tr>
                <td><small>${w.id}</small></td>
                <td>${w.customer}</td>
                <td class="text-danger">${formatCurrency(w.amount)}</td>
                <td><small>${w.method}</small></td>
                <td>${statusBadge(w.status)}</td>
                <td><small>${formatDate(w.date)}</small></td>
                <td><button class="btn btn-ghost btn-sm" onclick="openModal('viewWithdrawal','${w.id}')"><i class="bi bi-eye"></i></button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Loans
   ============================================ */
function renderLoans() {
  const loans = store.getLoans();
  const totalRemaining = loans.reduce((s, l) => s + l.remaining, 0);
  return `
    <div class="page-title-row">
      <div><h1>Loans</h1><p>Manage all customer loan applications and active loans.</p></div>
      <button class="btn btn-glow" onclick="openModal('addLoan')"><i class="bi bi-plus-circle me-1"></i> New Loan</button>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-sm-4">${metricCard('bi-bank', 'bg-primary-soft', 'Total Outstanding', formatCurrency(totalRemaining), '2.1%', 'down')}</div>
      <div class="col-sm-4">${metricCard('bi-check-circle', 'bg-success-soft', 'Active Loans', String(loans.filter(l=>l.status==='active').length), '4.5%', 'up')}</div>
      <div class="col-sm-4">${metricCard('bi-clock', 'bg-warning-soft', 'Pending', String(loans.filter(l=>l.status==='pending').length), '1.2%', 'up')}</div>
    </div>
    <div class="glass-card p-0">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Type</th><th>Amount</th><th>Remaining</th><th>Rate</th><th>EMI</th><th>Status</th><th>Next Due</th></tr></thead>
          <tbody>
            ${loans.map(l => `
              <tr>
                <td><small>${l.id}</small></td>
                <td>${l.customer}</td>
                <td>${l.type}</td>
                <td>${formatCurrency(l.amount)}</td>
                <td>${formatCurrency(l.remaining)}</td>
                <td>${l.rate}%</td>
                <td>${formatCurrency(l.emi)}</td>
                <td>${statusBadge(l.status)}</td>
                <td><small>${formatDate(l.nextDue)}</small></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Payments
   ============================================ */
function renderPayments() {
  const payments = store.getTransactions().filter(t => t.type === 'Payment' || t.type === 'Transfer');
  return `
    <div class="page-title-row">
      <div><h1>Payments</h1><p>Track all payment and transfer activity.</p></div>
    </div>
    <div class="glass-card p-0">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Type</th><th>Amount</th><th>Method</th><th>Description</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            ${payments.map(p => `
              <tr>
                <td><small>${p.id}</small></td>
                <td>${p.customer}</td>
                <td>${p.type}</td>
                <td>${formatCurrency(p.amount)}</td>
                <td><small>${p.method}</small></td>
                <td><small>${p.desc}</small></td>
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
   PAGE: Cards
   ============================================ */
function renderCards() {
  const cards = store.getCards();
  return `
    <div class="page-title-row">
      <div><h1>Cards</h1><p>Manage all issued bank cards.</p></div>
      <button class="btn btn-glow" onclick="openModal('issueCard')"><i class="bi bi-credit-card me-1"></i> Issue Card</button>
    </div>
    <div class="row g-3">
      ${cards.map(c => `
        <div class="col-md-6 col-lg-4">
          <div class="card-display card-display--${c.color} mb-3">
            <div class="card-display__top"><div class="card-display__type">${c.type}</div><i class="bi bi-wifi" style="font-size:1.2rem;transform:rotate(90deg)"></i></div>
            <div class="card-display__chip"></div>
            <div class="card-display__number">${c.number}</div>
            <div class="card-display__bottom"><div><div class="card-display__name">${c.customer}</div><small style="opacity:0.6">${c.expiry}</small></div><div class="card-display__brand">${c.type.includes('Visa') ? 'VISA' : 'MC'}</div></div>
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
      <div><h1>Investments</h1><p>Monitor managed investment portfolios.</p></div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-sm-4">${metricCard('bi-graph-up', 'bg-success-soft', 'Total Managed', formatCurrency(totalValue), '12.4%', 'up')}</div>
      <div class="col-sm-4">${metricCard('bi-trending-up', 'bg-primary-soft', 'Avg Return', '14.2%', '3.8%', 'up')}</div>
      <div class="col-sm-4">${metricCard('bi-cpu', 'bg-info-soft', 'AI Managed', '100%', 'Auto', 'up')}</div>
    </div>
    <div class="row g-3">
      ${investments.map(inv => `
        <div class="col-md-6 col-lg-3">
          <div class="glass-card investment-card">
            <div class="investment-card__header">
              <div class="investment-card__icon bg-${inv.color}-soft"><i class="bi bi-graph-up"></i></div>
              <span class="badge badge-${inv.change >= 0 ? 'success' : 'danger'}">${inv.change >= 0 ? '+' : ''}${inv.change}%</span>
            </div>
            <h4>${inv.name}</h4>
            <p class="investment-card__value">${formatCurrency(inv.value)}</p>
            <small class="text-muted-2">${inv.shares} shares &middot; ${inv.symbol}</small>
          </div>
        </div>`).join('')}
    </div>
  `;
}

/* ============================================
   PAGE: Reports
   ============================================ */
function renderReports() {
  return `
    <div class="page-title-row">
      <div><h1>Reports & Analytics</h1><p>Generate and download financial reports.</p></div>
      <button class="btn btn-glow" onclick="showToast('Report Generated','Your report has been generated successfully.','success')"><i class="bi bi-download me-1"></i> Download Report</button>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-lg-8">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>Revenue & Expenses</h3></div>
          <div class="chart-container-lg"><canvas id="reportChart1"></canvas></div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="glass-card widget-card">
          <div class="widget-card__header"><h3>By Category</h3></div>
          <div class="chart-container"><canvas id="reportChart2"></canvas></div>
        </div>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-md-6 col-lg-3"><div class="glass-card p-3 text-center"><i class="bi bi-file-earmark-spreadsheet text-success" style="font-size:2rem"></i><h5 class="mt-2 mb-0">Monthly Balance</h5><small class="text-muted-2">PDF &middot; 2.4MB</small><br><button class="btn btn-ghost btn-sm mt-2">Download</button></div></div>
      <div class="col-md-6 col-lg-3"><div class="glass-card p-3 text-center"><i class="bi bi-file-earmark-bar-graph text-primary" style="font-size:2rem"></i><h5 class="mt-2 mb-0">Transaction Report</h5><small class="text-muted-2">PDF &middot; 1.8MB</small><br><button class="btn btn-ghost btn-sm mt-2">Download</button></div></div>
      <div class="col-md-6 col-lg-3"><div class="glass-card p-3 text-center"><i class="bi bi-file-earmark-text text-info" style="font-size:2rem"></i><h5 class="mt-2 mb-0">Loan Portfolio</h5><small class="text-muted-2">PDF &middot; 3.1MB</small><br><button class="btn btn-ghost btn-sm mt-2">Download</button></div></div>
      <div class="col-md-6 col-lg-3"><div class="glass-card p-3 text-center"><i class="bi bi-file-earmark-richtext text-warning" style="font-size:2rem"></i><h5 class="mt-2 mb-0">Annual Report</h5><small class="text-muted-2">PDF &middot; 5.6MB</small><br><button class="btn btn-ghost btn-sm mt-2">Download</button></div></div>
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
      <div><h1>Notifications</h1><p>System alerts and customer notifications.</p></div>
      <button class="btn btn-glow" onclick="openModal('sendNotification')"><i class="bi bi-send me-1"></i> Send Notification</button>
    </div>
    <div class="glass-card p-3">
      ${notifs.map(n => `
        <div class="notification-item ${n.read ? '' : 'unread'}">
          <div class="notification-item__icon bg-${n.color}-soft"><i class="bi ${n.icon}"></i></div>
          <div class="notification-item__body"><h4>${n.title}</h4><p>${n.desc}</p><small>${n.time}</small></div>
        </div>`).join('')}
    </div>
  `;
}

/* ============================================
   PAGE: Settings
   ============================================ */
function renderSettings() {
  return `
    <div class="page-title-row">
      <div><h1>Settings</h1><p>Manage your admin preferences.</p></div>
    </div>
    <div class="row g-3">
      <div class="col-lg-4">
        <div class="glass-card p-3">
          <div class="settings-nav">
            <div class="settings-nav-item active"><i class="bi bi-person"></i> General</div>
            <div class="settings-nav-item"><i class="bi bi-shield-lock"></i> Security</div>
            <div class="settings-nav-item"><i class="bi bi-bell"></i> Notifications</div>
            <div class="settings-nav-item"><i class="bi bi-display"></i> Appearance</div>
            <div class="settings-nav-item"><i class="bi bi-key"></i> API Keys</div>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="glass-card p-4">
          <h3 class="mb-4">General Settings</h3>
          <div class="form-group"><label class="form-label">Admin Name</label><input type="text" class="form-control" value="Admin User" /></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" value="admin@Stackly.com" /></div>
          <div class="form-group"><label class="form-label">Bank Name</label><input type="text" class="form-control" value="Stackly" /></div>
          <div class="form-group"><label class="form-label">Currency</label><select class="form-select"><option>USD ($)</option><option>EUR (&euro;)</option><option>GBP (&pound;)</option></select></div>
          <div class="form-check form-switch my-3"><input class="form-check-input" type="checkbox" id="twoFa" checked /><label class="form-check-label text-muted-2" for="twoFa">Require 2FA for admin login</label></div>
          <button class="btn btn-glow" onclick="showToast('Settings Saved','Your settings have been updated.','success')">Save Changes</button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   PAGE: Profile
   ============================================ */
function renderProfile() {
  return `
    <div class="page-title-row"><div><h1>Profile</h1><p>Your admin profile information.</p></div></div>
    <div class="glass-card profile-header mb-4">
      <div class="profile-header__avatar">AD</div>
      <div class="profile-header__info"><h2>Admin User</h2><p>Administrator &middot; admin@Stackly.com</p><div class="mt-2"><span class="badge badge-success">Active</span> <span class="badge badge-primary">Full Access</span></div></div>
    </div>
    <div class="row g-3">
      <div class="col-lg-6">
        <div class="glass-card p-4">
          <h3 class="mb-3">Personal Information</h3>
          <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control" value="Admin User" /></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" value="admin@Stackly.com" /></div>
          <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-control" value="+1 555-0100" /></div>
          <div class="form-group"><label class="form-label">Role</label><input type="text" class="form-control" value="Administrator" disabled /></div>
          <button class="btn btn-glow" onclick="showToast('Profile Updated','Your profile has been saved.','success')">Update Profile</button>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="glass-card p-4">
          <h3 class="mb-3">Change Password</h3>
          <div class="form-group"><label class="form-label">Current Password</label><input type="password" class="form-control" placeholder="Enter current password" /></div>
          <div class="form-group"><label class="form-label">New Password</label><input type="password" class="form-control" placeholder="Enter new password" /></div>
          <div class="form-group"><label class="form-label">Confirm Password</label><input type="password" class="form-control" placeholder="Re-enter new password" /></div>
          <button class="btn btn-glow" onclick="showToast('Password Changed','Your password has been updated.','success')">Change Password</button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   MODALS
   ============================================ */
window.openModal = function(type, id) {
  const modalEl = document.getElementById('actionModal');
  const titleEl = document.getElementById('actionModalTitle');
  const bodyEl = document.getElementById('actionModalBody');
  const footerEl = document.getElementById('actionModalFooter');

  const modals = {
    addCustomer: () => ({ title: 'Add New Customer', body: customerForm(), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button><button class="btn btn-glow" onclick="saveCustomer()">Save Customer</button>` }),
    editCustomer: () => { const c = store.getCustomers().find(x => x.id === id); return { title: 'Edit Customer', body: customerForm(c), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button><button class="btn btn-glow" onclick="saveCustomer()">Update</button>` }; },
    viewCustomer: () => { const c = store.getCustomers().find(x => x.id === id); return { title: 'Customer Details', body: customerView(c), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Close</button>` }; },
    addAccount: () => ({ title: 'Create New Account', body: accountForm(), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button><button class="btn btn-glow" onclick="showToast('Account Created','New account has been created.','success');closeModal()">Create</button>` }),
    addTransaction: () => ({ title: 'New Transaction', body: txnForm(), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button><button class="btn btn-glow" onclick="showToast('Transaction Added','Transaction created successfully.','success');closeModal()">Submit</button>` }),
    addDeposit: () => ({ title: 'Record Deposit', body: depositForm(), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button><button class="btn btn-glow" onclick="showToast('Deposit Recorded','Deposit has been recorded.','success');closeModal()">Record</button>` }),
    addWithdrawal: () => ({ title: 'Record Withdrawal', body: withdrawalForm(), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button><button class="btn btn-glow" onclick="showToast('Withdrawal Recorded','Withdrawal has been recorded.','success');closeModal()">Record</button>` }),
    addLoan: () => ({ title: 'New Loan Application', body: loanForm(), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button><button class="btn btn-glow" onclick="showToast('Loan Created','Loan has been created.','success');closeModal()">Create</button>` }),
    issueCard: () => ({ title: 'Issue New Card', body: cardForm(), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button><button class="btn btn-glow" onclick="showToast('Card Issued','Card has been issued.','success');closeModal()">Issue</button>` }),
    sendNotification: () => ({ title: 'Send Notification', body: notifForm(), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button><button class="btn btn-glow" onclick="showToast('Notification Sent','Notification has been sent.','success');closeModal()">Send</button>` }),
    generateReport: () => ({ title: 'Generate Report', body: `<p class="text-muted-2">Select the type of report you want to generate:</p><div class="d-grid gap-2 mt-3"><button class="btn btn-ghost" onclick="showToast('Generating...','Monthly report is being generated.','info');closeModal()">Monthly Balance Report</button><button class="btn btn-ghost" onclick="showToast('Generating...','Transaction report is being generated.','info');closeModal()">Transaction Report</button><button class="btn btn-ghost" onclick="showToast('Generating...','Annual report is being generated.','info');closeModal()">Annual Report</button></div>`, footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Close</button>` }),
    viewDeposit: () => { const d = store.getTransactions().find(x => x.id === id); return { title: 'Deposit Details', body: txnView(d), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Close</button>` }; },
    viewWithdrawal: () => { const w = store.getTransactions().find(x => x.id === id); return { title: 'Withdrawal Details', body: txnView(w), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Close</button>` }; },
    viewCard: () => { const c = store.getCards().find(x => x.id === id); return { title: 'Card Management', body: cardView(c), footer: `<button class="btn btn-ghost" data-bs-dismiss="modal">Close</button><button class="btn btn-glow" onclick="showToast('Card Updated','Card settings saved.','success');closeModal()">Save</button>` }; },
  };

  const fn = modals[type];
  if (!fn) return;
  const { title, body, footer } = fn();
  titleEl.textContent = title;
  bodyEl.innerHTML = body;
  footerEl.innerHTML = footer;
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
};

window.closeModal = function() {
  const modalEl = document.getElementById('actionModal');
  bootstrap.Modal.getOrCreateInstance(modalEl).hide();
};

window.navigateTo = function(page) {
  document.querySelectorAll('.sidebar-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  currentPage = page;
  renderPage(page);
};

window.saveCustomer = function() {
  showToast('Customer Saved', 'Customer information has been saved.', 'success');
  closeModal();
};

/* ---- Modal form templates ---- */
function customerForm(c = {}) {
  return `
    <div class="row g-3">
      <div class="col-md-6"><label class="form-label">Full Name</label><input type="text" class="form-control" value="${c.name || ''}" placeholder="John Doe" /></div>
      <div class="col-md-6"><label class="form-label">Email</label><input type="email" class="form-control" value="${c.email || ''}" placeholder="john@email.com" /></div>
      <div class="col-md-6"><label class="form-label">Phone</label><input type="tel" class="form-control" value="${c.phone || ''}" placeholder="+1 555-0100" /></div>
      <div class="col-md-6"><label class="form-label">Account Type</label><select class="form-select"><option ${c.type==='Personal'?'selected':''}>Personal</option><option ${c.type==='Business'?'selected':''}>Business</option><option ${c.type==='Premium'?'selected':''}>Premium</option></select></div>
      <div class="col-md-6"><label class="form-label">Initial Balance</label><input type="number" class="form-control" value="${c.balance || 0}" /></div>
      <div class="col-md-6"><label class="form-label">Status</label><select class="form-select"><option ${c.status==='active'?'selected':''}>active</option><option ${c.status==='pending'?'selected':''}>pending</option><option ${c.status==='inactive'?'selected':''}>inactive</option></select></div>
    </div>`;
}

function customerView(c) {
  if (!c) return '<p class="text-muted-2">Customer not found.</p>';
  return `
    <div class="profile-header" style="padding:0">
      <div class="profile-header__avatar ${avatarBg(c.name)}" style="width:64px;height:64px;font-size:1.5rem">${c.avatar}</div>
      <div class="profile-header__info"><h2>${c.name}</h2><p>${c.email}</p><span class="badge badge-${c.status==='active'?'success':'warning'}">${c.status}</span></div>
    </div>
    <div class="row g-3 mt-3">
      <div class="col-6"><small class="text-muted-2">Customer ID</small><p><strong>${c.id}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Phone</small><p><strong>${c.phone}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Type</small><p><strong>${c.type}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Balance</small><p><strong>${formatCurrency(c.balance)}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Joined</small><p><strong>${formatDate(c.joined)}</strong></p></div>
    </div>`;
}

function accountForm() {
  const customers = store.getCustomers();
  return `
    <div class="row g-3">
      <div class="col-12"><label class="form-label">Customer</label><select class="form-select">${customers.map(c => `<option>${c.name} (${c.id})</option>`).join('')}</select></div>
      <div class="col-md-6"><label class="form-label">Account Type</label><select class="form-select"><option>Checking</option><option>Savings</option><option>Business</option><option>Premium</option></select></div>
      <div class="col-md-6"><label class="form-label">Initial Deposit</label><input type="number" class="form-control" value="1000" /></div>
      <div class="col-12"><label class="form-label">Currency</label><select class="form-select"><option>USD ($)</option><option>EUR (&euro;)</option><option>GBP (&pound;)</option></select></div>
    </div>`;
}

function txnForm() {
  const customers = store.getCustomers();
  return `
    <div class="row g-3">
      <div class="col-12"><label class="form-label">Customer</label><select class="form-select">${customers.map(c => `<option>${c.name}</option>`).join('')}</select></div>
      <div class="col-md-6"><label class="form-label">Type</label><select class="form-select"><option>Deposit</option><option>Withdrawal</option><option>Transfer</option><option>Payment</option></select></div>
      <div class="col-md-6"><label class="form-label">Amount</label><input type="number" class="form-control" placeholder="0.00" /></div>
      <div class="col-md-6"><label class="form-label">Method</label><select class="form-select"><option>Wire Transfer</option><option>ACH</option><option>ATM</option><option>Online</option><option>Check</option><option>Card</option></select></div>
      <div class="col-md-6"><label class="form-label">Status</label><select class="form-select"><option>completed</option><option>pending</option><option>failed</option></select></div>
      <div class="col-12"><label class="form-label">Description</label><input type="text" class="form-control" placeholder="Transaction description" /></div>
    </div>`;
}

function depositForm() {
  const customers = store.getCustomers();
  return `
    <div class="row g-3">
      <div class="col-12"><label class="form-label">Customer</label><select class="form-select">${customers.map(c => `<option>${c.name}</option>`).join('')}</select></div>
      <div class="col-md-6"><label class="form-label">Amount</label><input type="number" class="form-control" placeholder="0.00" /></div>
      <div class="col-md-6"><label class="form-label">Method</label><select class="form-select"><option>Wire Transfer</option><option>ACH</option><option>Check</option><option>Cash</option></select></div>
      <div class="col-12"><label class="form-label">Description</label><input type="text" class="form-control" placeholder="Deposit description" /></div>
    </div>`;
}

function withdrawalForm() {
  const customers = store.getCustomers();
  return `
    <div class="row g-3">
      <div class="col-12"><label class="form-label">Customer</label><select class="form-select">${customers.map(c => `<option>${c.name}</option>`).join('')}</select></div>
      <div class="col-md-6"><label class="form-label">Amount</label><input type="number" class="form-control" placeholder="0.00" /></div>
      <div class="col-md-6"><label class="form-label">Method</label><select class="form-select"><option>ATM</option><option>Wire Transfer</option><option>Online</option><option>Cash</option></select></div>
      <div class="col-12"><label class="form-label">Description</label><input type="text" class="form-control" placeholder="Withdrawal description" /></div>
    </div>`;
}

function loanForm() {
  const customers = store.getCustomers();
  return `
    <div class="row g-3">
      <div class="col-12"><label class="form-label">Customer</label><select class="form-select">${customers.map(c => `<option>${c.name}</option>`).join('')}</select></div>
      <div class="col-md-6"><label class="form-label">Loan Type</label><select class="form-select"><option>Home Loan</option><option>Auto Loan</option><option>Personal Loan</option><option>Business Loan</option></select></div>
      <div class="col-md-6"><label class="form-label">Amount</label><input type="number" class="form-control" placeholder="0.00" /></div>
      <div class="col-md-6"><label class="form-label">Interest Rate (%)</label><input type="number" class="form-control" step="0.1" placeholder="3.5" /></div>
      <div class="col-md-6"><label class="form-label">Term (months)</label><input type="number" class="form-control" placeholder="360" /></div>
    </div>`;
}

function cardForm() {
  const customers = store.getCustomers();
  return `
    <div class="row g-3">
      <div class="col-12"><label class="form-label">Customer</label><select class="form-select">${customers.map(c => `<option>${c.name}</option>`).join('')}</select></div>
      <div class="col-md-6"><label class="form-label">Card Type</label><select class="form-select"><option>Visa Platinum</option><option>Mastercard Gold</option><option>Visa Business</option><option>Visa Infinite</option></select></div>
      <div class="col-md-6"><label class="form-label">Credit Limit</label><input type="number" class="form-control" value="50000" /></div>
    </div>`;
}

function notifForm() {
  return `
    <div class="row g-3">
      <div class="col-12"><label class="form-label">Title</label><input type="text" class="form-control" placeholder="Notification title" /></div>
      <div class="col-md-6"><label class="form-label">Target</label><select class="form-select"><option>All Customers</option><option>Active Customers</option><option>Business Customers</option><option>Premium Customers</option></select></div>
      <div class="col-md-6"><label class="form-label">Type</label><select class="form-select"><option>General</option><option>Security</option><option>Promotional</option><option>Transaction</option></select></div>
      <div class="col-12"><label class="form-label">Message</label><textarea class="form-control" rows="4" placeholder="Notification message..."></textarea></div>
    </div>`;
}

function txnView(t) {
  if (!t) return '<p class="text-muted-2">Transaction not found.</p>';
  return `
    <div class="row g-3">
      <div class="col-6"><small class="text-muted-2">Transaction ID</small><p><strong>${t.id}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Customer</small><p><strong>${t.customer}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Account</small><p><strong>${t.accountId}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Type</small><p><strong>${t.type}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Amount</small><p><strong>${formatCurrency(t.amount)}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Method</small><p><strong>${t.method}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Status</small><p>${statusBadge(t.status)}</p></div>
      <div class="col-6"><small class="text-muted-2">Date</small><p><strong>${formatDate(t.date)}</strong></p></div>
      <div class="col-12"><small class="text-muted-2">Description</small><p><strong>${t.desc}</strong></p></div>
    </div>`;
}

function cardView(c) {
  if (!c) return '<p class="text-muted-2">Card not found.</p>';
  return `
    <div class="card-display card-display--${c.color} mb-3">
      <div class="card-display__top"><div class="card-display__type">${c.type}</div><i class="bi bi-wifi" style="font-size:1.2rem;transform:rotate(90deg)"></i></div>
      <div class="card-display__chip"></div>
      <div class="card-display__number">${c.number}</div>
      <div class="card-display__bottom"><div><div class="card-display__name">${c.customer}</div><small style="opacity:0.6">${c.expiry}</small></div><div class="card-display__brand">${c.type.includes('Visa')?'VISA':'MC'}</div></div>
    </div>
    <div class="row g-3">
      <div class="col-6"><small class="text-muted-2">Credit Limit</small><p><strong>${formatCurrency(c.limit)}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Spent</small><p><strong>${formatCurrency(c.spent)}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Available</small><p><strong>${formatCurrency(c.limit - c.spent)}</strong></p></div>
      <div class="col-6"><small class="text-muted-2">Status</small><p>${statusBadge(c.status)}</p></div>
    </div>
    <div class="d-flex gap-2 mt-3">
      <button class="btn btn-ghost btn-sm flex-fill" onclick="showToast('Card Frozen','Card has been frozen.','warning')">Freeze</button>
      <button class="btn btn-ghost btn-sm flex-fill" onclick="showToast('Limit Updated','Credit limit updated.','success')">Update Limit</button>
    </div>`;
}

/* ============================================
   CHARTS
   ============================================ */
function initCharts(page) {
  const theme = chartTheme();
  const grid = theme.grid;
  const ticks = theme.ticks;

  if (page === 'dashboard') {
    const ctx1 = document.getElementById('dashChart1');
    if (ctx1) {
      charts.c1 = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [
            { label: 'Deposits', data: [2.1,2.4,2.8,3.1,3.5,3.8,4.2,4.5,4.8,5.1,5.4,5.8], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
            { label: 'Withdrawals', data: [1.2,1.4,1.5,1.7,1.8,2.0,2.1,2.3,2.4,2.5,2.7,2.8], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: ticks } } }, scales: { x: { grid: { color: grid }, ticks: { color: ticks } }, y: { grid: { color: grid }, ticks: { color: ticks } } } }
      });
    }
    const ctx2 = document.getElementById('dashChart2');
    if (ctx2) {
      charts.c2 = new Chart(ctx2, {
        type: 'doughnut',
        data: { labels: ['Deposits','Withdrawals','Transfers','Payments'], datasets: [{ data: [35,20,25,20], backgroundColor: ['#10b981','#ef4444','#2563eb','#22d3ee'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: ticks } } } }
      });
    }
    const ctx3 = document.getElementById('dashChart3');
    if (ctx3) {
      charts.c3 = new Chart(ctx3, {
        type: 'bar',
        data: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ label: 'Active Users', data: [3200,4100,3800,5200,6100,2800,2400], backgroundColor: '#2563eb', borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: grid }, ticks: { color: ticks } }, y: { grid: { color: grid }, ticks: { color: ticks } } } }
      });
    }
  }

  if (page === 'reports') {
    const ctx1 = document.getElementById('reportChart1');
    if (ctx1) {
      charts.r1 = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'],
          datasets: [
            { label: 'Revenue', data: [1.2,1.4,1.6,1.8,2.1,2.4,2.7,3.1], backgroundColor: '#10b981', borderRadius: 6 },
            { label: 'Expenses', data: [0.8,0.9,1.0,1.1,1.2,1.3,1.4,1.5], backgroundColor: '#ef4444', borderRadius: 6 },
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: ticks } } }, scales: { x: { grid: { color: grid }, ticks: { color: ticks } }, y: { grid: { color: grid }, ticks: { color: ticks } } } }
      });
    }
    const ctx2 = document.getElementById('reportChart2');
    if (ctx2) {
      charts.r2 = new Chart(ctx2, {
        type: 'pie',
        data: { labels: ['Loans','Cards','Investments','Deposits','Fees'], datasets: [{ data: [40,20,15,15,10], backgroundColor: ['#2563eb','#10b981','#22d3ee','#f5b942','#ef4444'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: ticks } } } }
      });
    }
  }
}

/* ============================================
   PAGE EVENTS
   ============================================ */
function initPageEvents(page) {
  if (page === 'dashboard' || page === 'reports') {
    setTimeout(() => initCharts(page), 50);
  }
  if (page === 'customers') {
    const search = document.getElementById('custSearch');
    if (search) search.addEventListener('input', filterCustomers);
    const ftype = document.getElementById('custFilterType');
    if (ftype) ftype.addEventListener('change', filterCustomers);
    const fstatus = document.getElementById('custFilterStatus');
    if (fstatus) fstatus.addEventListener('change', filterCustomers);
  }
}

function filterCustomers() {
  const search = document.getElementById('custSearch')?.value.toLowerCase() || '';
  const type = document.getElementById('custFilterType')?.value || '';
  const status = document.getElementById('custFilterStatus')?.value || '';
  const rows = document.querySelectorAll('#custTable tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const show = text.includes(search) && (!type || text.includes(type.toLowerCase())) && (!status || text.includes(status));
    row.style.display = show ? '' : 'none';
  });
}

window.navigateTo = function(page) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  currentPage = page;
  renderPage(page);
};

/* ============================================
   INIT
   ============================================ */
function initAdmin() {
  initSidebar();
  initThemeToggle();
  // Update sidebar user info dynamically
  const avatarEl = document.querySelector('.sidebar-user__avatar');
  const nameEl = document.querySelector('.sidebar-user__info strong');
  if (avatarEl) avatarEl.textContent = ADMIN.avatar;
  if (nameEl) nameEl.textContent = ADMIN.name;

  if (typeof navigateTo === 'function') {
    navigateTo('dashboard');
  } else {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.page === 'dashboard'));
    currentPage = 'dashboard';
    renderPage('dashboard');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

