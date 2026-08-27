/* ============================================
   Stackly — Main JS (Shared across all pages)
   ============================================
   Handles:
   - Loading screen
   - Navbar injection & mobile menu
   - Footer injection
   - Dark / Light theme toggle
   - Scroll reveal animations
   - Animated stat counters
   - Smooth scrolling
   - Navbar scroll state
   - Toast notifications
   ============================================ */



/* ---- Navbar ---- */
const navLinks = [
  { href: 'index.html', label: 'Home' },
  { href: 'about.html', label: 'About' },
  { href: 'services.html', label: 'Services' },
  { href: 'loans.html', label: 'Loans' },
  { href: 'investments.html', label: 'Investments' },
  { href: 'cards.html', label: 'Cards' },
  { href: 'contact.html', label: 'Contact' },
];

function injectNavbar() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const currentPage = location.pathname.split('/').pop() || 'index.html';

  const linksHtml = navLinks.map(l => `
    <li class="nav-item">
      <a class="nav-link ${currentPage === l.href ? 'active' : ''}" href="${l.href}">${l.label}</a>
    </li>
  `).join('');

  nav.innerHTML = `
    <div class="container">
      <a class="navbar-brand" href="index.html">
        <img src="assets/images/logo-stackly.webp" alt="Stackly" class="project-logo">
      </a>
      <button class="navbar-toggler border-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#navOffcanvas" aria-controls="navOffcanvas" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"><span></span></span>
      </button>

      <!-- Desktop Menu -->
      <div class="collapse navbar-collapse d-none d-xl-flex" id="navMenuDesktop">
        <ul class="navbar-nav mx-auto">
          ${linksHtml}
        </ul>
        <div class="nav-actions ms-auto">
          <span class="nav-divider d-none d-xl-block"></span>
          ${(() => {
      const session = typeof store !== 'undefined' ? store.getSession() : null;
      if (session && session.role) {
        const dashLink = session.role === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html';
        return `<a href="${dashLink}" class="btn btn-glow btn-sm">Dashboard</a>`;
      }
      return `
              <a href="login.html" class="btn btn-ghost btn-sm d-none d-xl-inline-flex">Sign in</a>
              <a href="register.html" class="btn btn-glow btn-sm">Get started</a>
            `;
    })()}
        </div>
      </div>
    </div>
  `;

  // Inject offcanvas directly into body to avoid backdrop-filter trapping
  const offcanvasHtml = `
    <!-- Mobile Offcanvas Menu (Dark Theme as requested) -->
    <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="navOffcanvas" aria-labelledby="navOffcanvasLabel" style="width: 320px; background-color: #0b1120 !important;">
      <div class="offcanvas-header p-4 pb-2">
        <a class="navbar-brand text-white d-flex align-items-center" href="index.html">
          <img src="assets/images/logo-stackly.webp" alt="Stackly" class="project-logo">
        </a>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body p-4 d-flex flex-column">
        <ul class="navbar-nav offcanvas-custom-nav mb-4" style="gap: 0.5rem;">
          ${navLinks.map(l => {
    const isActive = currentPage === l.href;
    return `
            <li class="nav-item">
              <a class="nav-link fs-6 fw-medium" style="color: ${isActive ? '#0ea5e9' : '#f8f9fa'}; display: inline-flex; flex-direction: column; align-items: flex-start;" href="${l.href}">
                ${l.label}
                ${isActive ? '<span style="width: 5px; height: 5px; background-color: #0ea5e9; border-radius: 50%; display: block; margin-top: 4px; align-self: center;"></span>' : ''}
              </a>
            </li>
          `}).join('')}
        </ul>
        
        <div class="mt-auto">
          ${(() => {
      const session = typeof store !== 'undefined' ? store.getSession() : null;
      if (session && session.role) {
        const dashLink = session.role === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html';
        return `<a href="${dashLink}" class="btn rounded-pill btn-lg w-100 fw-bold mb-3 text-white" style="background: linear-gradient(90deg, #2563eb, #0ea5e9); border: none;">Dashboard</a>`;
      }
      return `
              <a href="login.html" class="btn rounded-pill btn-lg w-100 fw-bold mb-3 text-white" style="background: #1f2937; border: 1px solid #374151;">Sign In</a>
              <a href="register.html" class="btn rounded-pill btn-lg w-100 fw-bold mb-4 text-white shadow-none" style="background: linear-gradient(90deg, #2563eb, #0ea5e9); border: none;">Join Now</a>
            `;
    })()}
          
          <div class="contact-info-section mt-1 mb-5">
            <p class="text-uppercase fw-bold mb-2" style="color: #9ca3af; font-size: 0.7rem; letter-spacing: 1px;">Contact Info</p>
            <div class="d-flex align-items-center text-white mb-2" style="opacity: 0.9;">
              <i class="bi bi-geo-alt text-info me-3 fs-6" style="color: #0ea5e9 !important;"></i>
              <span class="fw-medium fs-6">Salem, Tamilnadu</span>
            </div>
            <div class="d-flex align-items-center text-white mb-2" style="opacity: 0.9;">
              <i class="bi bi-telephone text-info me-3 fs-6" style="color: #0ea5e9 !important;"></i>
              <span class="fw-medium fs-6">+91 98765 43210</span>
            </div>
            <div class="d-flex align-items-center text-white" style="opacity: 0.9;">
              <i class="bi bi-envelope text-info me-3 fs-6" style="color: #0ea5e9 !important;"></i>
              <span class="fw-medium fs-6">info@thestackly.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', offcanvasHtml);
}

/* ---- Footer ---- */
function injectFooter() {
  const footer = document.getElementById('main-footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <a href="index.html">
              <img src="assets/images/logo-stackly.webp" alt="Stackly" class="project-logo">
            </a>
          </div>
          <p class="footer-text">Premium banking & finance for the modern world. Secure, smart and beautiful — your money, simplified.</p>
          <div class="footer-social">
            <a href="404.html" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
            <a href="404.html" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
            <a href="404.html" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="404.html" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
          </div>
        </div>
        <div class="footer-col">
          <h5>Quick Links</h5>
          <ul>
            ${navLinks.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}
          </ul>
        </div>
        <div class="footer-col">
          <h5>Explore</h5>
          <ul>
            <li><a href="about.html">Careers</a></li>
            <li><a href="contact.html">Support Center</a></li>
            <li><a href="404.html">Press & Media</a></li>
            <li><a href="404.html">Investor Relations</a></li>
            <li><a href="404.html">API Documentation</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Stay Updated</h5>
          <p class="footer-text" style="margin-bottom:1rem">Subscribe to our newsletter for the latest financial insights and offers.</p>
          <form class="footer-newsletter" onsubmit="return false;">
            <input type="email" placeholder="Your email address" aria-label="Email" />
            <button type="submit" class="btn btn-glow w-100">Subscribe</button>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Stackly. All rights reserved. Member FDIC.</p>
        <div class="footer-bottom-links">
          <a href="404.html">Privacy Policy</a>
          <a href="404.html">Terms of Service</a>
          <a href="404.html">Security</a>
          <a href="404.html">Sitemap</a>
        </div>
      </div>
    </div>
  `;
}

/* ---- Theme ---- */
function initTheme() {
  document.documentElement.setAttribute('data-theme', 'light');
  localStorage.setItem(STORAGE_KEYS.theme, 'light');
  updateThemeIcon('light');
}

function toggleTheme() {
  // Theme toggle disabled
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.style.display = 'none';
}

/* ---- Loader ---- */
function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('hidden'), 600);
}

/* ---- Scroll reveal ---- */
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ---- Animated counters ---- */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = prefix + value.toLocaleString('en-US') + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ---- Navbar scroll state ---- */
function initNavScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  const update = () => {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---- Toast ---- */
function showToast(title, message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'bi-check-circle',
    error: 'bi-x-circle',
    info: 'bi-info-circle',
    warning: 'bi-exclamation-triangle',
  };

  const toast = document.createElement('div');
  toast.className = `nb-toast nb-toast--${type}`;
  toast.innerHTML = `
    <div class="nb-toast__icon"><i class="bi ${icons[type] || icons.success}"></i></div>
    <div class="nb-toast__body">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
    <button class="nb-toast__close" aria-label="Close"><i class="bi bi-x"></i></button>
  `;

  container.appendChild(toast);

  const remove = () => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.nb-toast__close').addEventListener('click', remove);
  setTimeout(remove, 4000);
}

/* ---- Newsletter form ---- */
function initNewsletterForm() {
  const form = document.querySelector('.footer-newsletter');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (input && input.value) {
      showToast('Subscribed!', 'You have been added to our newsletter.', 'success');
      input.value = '';
    }
  });
}

/* ---- Init ---- */
function initMain() {
  initTheme();
  injectNavbar();
  injectFooter();
  hideLoader();
  initNavScroll();
  initScrollReveal();
  initCounters();
  initNewsletterForm();

  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, .btn, .quick-action-btn, .txn-item, .service-card, .product-card, [onclick]');
    if (!target) return;

    const isNavbar = target.closest('.main-nav, .navbar, .dashboard-topbar');
    const isSidebar = target.closest('aside, .sidebar-nav, .sidebar-header, .sidebar-footer, .offcanvas');
    const isAuth = target.closest('.auth-page, .auth-form-side, .role-selector');
    const isErrorPage = target.closest('.error-page');
    const isToast = target.closest('.toast-container, .nb-toast');
    const isModalClose = target.hasAttribute('data-bs-dismiss') || target.classList.contains('btn-close');
    const isAccordion = target.closest('.accordion, [data-bs-toggle="collapse"]');
    const isFooter = target.closest('#main-footer, footer');

    // Allow interaction if it's within excluded areas
    if (isNavbar || isSidebar || isAuth || isErrorPage || isToast || isModalClose || isAccordion || isFooter) {
      if (target.tagName === 'A' && target.getAttribute('href') === '#') {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    // Intercept everything else and go to 404
    e.preventDefault();
    e.stopPropagation();
    window.location.href = '404.html';
  }, true);

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Global listener to disallow numbers in any "Name" field, and alphabets in "Phone" fields
  document.addEventListener('input', (e) => {
    if (e.target && e.target.tagName === 'INPUT') {
      const input = e.target;
      const idStr = (input.id || '').toLowerCase();
      const nameAttr = (input.name || '').toLowerCase();
      const prev = input.previousElementSibling;
      const placeholder = (input.placeholder || '').toLowerCase();

      const labelText = (prev && prev.tagName === 'LABEL') ? prev.textContent.toLowerCase() : '';

      const isName = idStr.includes('name') ||
        nameAttr.includes('name') ||
        labelText.includes('name') ||
        placeholder.includes('name');

      const isPhone = input.type === 'tel' ||
        idStr.includes('phone') ||
        nameAttr.includes('phone') ||
        labelText.includes('phone') ||
        placeholder.includes('phone');

      if (isName) {
        // Strip out any numbers
        input.value = input.value.replace(/[0-9]/g, '');
      } else if (isPhone) {
        // Strip out any alphabets
        input.value = input.value.replace(/[a-zA-Z]/g, '');
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain);
} else {
  initMain();
}

