/**
 * AURA & SOLACE - Main Application Scripts
 * Shared UI behaviors, Auth state observer, Navigation & Newsletter
 */

document.addEventListener('DOMContentLoaded', async () => {
  initNavbarScroll();
  initActiveNav();
  await checkAuthNavbar();
  initNewsletterForms();
  initSmoothScroll();
  initNumericPhoneInputs();
});

// Sticky Navbar Scroll
function initNavbarScroll() {
  const navbar = document.querySelector('.aura-navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// Active navigation link highlighting based on current pathname
function initActiveNav() {
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.aura-nav-link:not(.dropdown-toggle)');

  navLinks.forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (!href || href === '#' || href.startsWith('javascript:')) return;

    link.classList.remove('active');

    if (currentPath.endsWith(href) && href !== 'index.html') {
      link.classList.add('active');
    } else if ((currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/')) && href === 'index.html') {
      link.classList.add('active');
    } else if (currentPath.includes('blog-details') && href === 'blog.html') {
      link.classList.add('active');
    }
  });

  // Handle all dropdown toggles & active child items (Home, Blog, etc.)
  document.querySelectorAll('.nav-item.dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.aura-nav-link.dropdown-toggle');
    const items = dropdown.querySelectorAll('.dropdown-item');
    if (!toggle) return;

    toggle.classList.remove('active');
    let hasActiveChild = false;

    items.forEach(item => {
      const itemHref = (item.getAttribute('href') || '').toLowerCase();
      item.classList.remove('active', 'fw-bold');

      if (!itemHref || itemHref === '#') return;

      if (currentPath.endsWith(itemHref)) {
        if (itemHref === 'index.html' && !(currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/'))) {
          // not home page
        } else {
          item.classList.add('active', 'fw-bold');
          hasActiveChild = true;
        }
      } else if (itemHref === 'index.html' && (currentPath === '/' || currentPath.endsWith('/'))) {
        item.classList.add('active', 'fw-bold');
        hasActiveChild = true;
      }
    });

    if (hasActiveChild) {
      toggle.classList.add('active');
    }
  });
}

// Auth State Observer for Navbar
async function checkAuthNavbar() {
  const authContainer = document.getElementById('navbar-auth-container');
  if (!authContainer) return;

  try {
    const authData = await API.getMe();

    if (authData && authData.authenticated && authData.user) {
      const user = authData.user;
      const isAdmin = user.role === 'admin';
      const dashboardUrl = isAdmin ? 'admin.html' : 'dashboard.html';
      const dashboardTitle = isAdmin ? 'Admin Portal' : 'Client Dashboard';
      const badgeText = isAdmin ? 'Admin' : 'Member';

      authContainer.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-aura-secondary dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="aura-brand-icon" style="width: 28px; height: 28px; font-size: 0.9rem;">
              <i class="bi bi-person-fill"></i>
            </span>
            <span class="fw-semibold text-truncate" style="max-width: 130px;">${user.full_name.split(' ')[0]}</span>
            <span class="badge ${isAdmin ? 'bg-dark' : 'bg-warning text-dark'} ms-1" style="font-size: 0.7rem;">${badgeText}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 py-2 mt-2" style="min-width: 220px; border-radius: 14px;">
            <li class="px-3 py-2 border-bottom">
              <div class="fw-bold text-dark">${user.full_name}</div>
              <div class="small text-muted text-truncate">${user.email}</div>
            </li>
            <li>
              <a class="dropdown-item py-2 d-flex align-items-center gap-2 mt-1" href="${dashboardUrl}">
                <i class="bi bi-speedometer2 text-warning"></i> ${dashboardTitle}
              </a>
            </li>
            ${!isAdmin ? `
            <li>
              <a class="dropdown-item py-2 d-flex align-items-center gap-2" href="dashboard.html#bookings">
                <i class="bi bi-calendar-check text-warning"></i> My Bookings
              </a>
            </li>
            <li>
              <a class="dropdown-item py-2 d-flex align-items-center gap-2" href="dashboard.html#membership">
                <i class="bi bi-gem text-warning"></i> My Membership
              </a>
            </li>
            ` : ''}
            <li><hr class="dropdown-divider my-1"></li>
            <li>
              <a class="dropdown-item py-2 d-flex align-items-center gap-2 text-danger" href="javascript:void(0)" onclick="API.logout()">
                <i class="bi bi-box-arrow-right"></i> Log Out
              </a>
            </li>
          </ul>
        </div>
      `;
    } else {
      // Unauthenticated view
      authContainer.innerHTML = `
        <div class="d-flex align-items-center gap-2 flex-nowrap">
          <a href="login.html" class="btn btn-aura-secondary d-flex align-items-center gap-1">
            <i class="bi bi-person"></i>
            <span>Client Login</span>
          </a>
          <a href="book.html" class="btn btn-aura-primary d-none d-sm-inline-flex">
            <span>Book a Session</span>
          </a>
        </div>
      `;
    }
  } catch (err) {
    console.warn("Navbar auth check error:", err);
  }
}

// Global Newsletter Subscription Handlers
function initNewsletterForms() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value.trim()) return;

      const email = input.value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`;
      }

      try {
        await API.subscribeNewsletter(email);
        Toast.success("Welcome to our sanctuary circle! You are now subscribed to our wellness journal.");
        form.reset();
      } catch (err) {
        Toast.error(err.message || "Could not subscribe. Please try again.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  });
}

// Smooth scroll helper for internal hash links with sticky navbar offset
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      try {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const navbar = document.querySelector('.aura-navbar');
          const navHeight = navbar ? navbar.offsetHeight : 80;
          const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = Math.max(0, elementPosition - navHeight - 16);
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      } catch (err) {
        // Fallback
      }
    });
  });
}

// -------------------------------------------------------------
// STRICT NUMBERS-ONLY INPUT RESTRICTION (No Alphabet Allowed)
// -------------------------------------------------------------
const PHONE_INPUT_SELECTOR = 'input[type="tel"], input[data-numbers-only], #contact-phone, #client-phone, #register-phone, #profile-phone';

function isPhoneOrNumberInput(el) {
  if (!el || !el.matches) return false;
  return el.matches(PHONE_INPUT_SELECTOR);
}

// Initialize input attributes across all matching phone fields
function initNumericPhoneInputs() {
  const inputs = document.querySelectorAll(PHONE_INPUT_SELECTOR);
  inputs.forEach(input => {
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('pattern', '[0-9]*');
    if (!input.getAttribute('maxlength')) {
      input.setAttribute('maxlength', '15');
    }
    input.setAttribute('title', 'Numbers only (0-9)');
  });
}

// 1. Intercept keydown to immediately block alphabet letters (a-z, A-Z) and symbols
document.addEventListener('keydown', (e) => {
  if (!isPhoneOrNumberInput(e.target)) return;

  // Allow navigation and editing control keys
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];
  if (allowedKeys.includes(e.key)) return;

  // Allow standard Ctrl/Cmd shortcuts (Copy, Paste, Cut, Select All, Undo)
  if (e.ctrlKey || e.metaKey) return;

  // Strictly block any character that is not a numeric digit 0-9
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
});

// 2. Intercept beforeinput (mobile virtual keyboards and IME)
document.addEventListener('beforeinput', (e) => {
  if (!isPhoneOrNumberInput(e.target)) return;
  if (e.data && /[^0-9]/.test(e.data)) {
    e.preventDefault();
  }
});

// 3. Real-time sanitize on input event (strips alphabetic letters on paste/autofill)
document.addEventListener('input', (e) => {
  if (!isPhoneOrNumberInput(e.target)) return;
  const input = e.target;
  const original = input.value;
  const numbersOnly = original.replace(/[^0-9]/g, '');
  if (original !== numbersOnly) {
    input.value = numbersOnly;
  }
});

// 4. Intercept paste event: strip letters and paste digits only
document.addEventListener('paste', (e) => {
  if (!isPhoneOrNumberInput(e.target)) return;
  e.preventDefault();
  const pasteData = (e.clipboardData || window.clipboardData).getData('text') || '';
  const numbersOnly = pasteData.replace(/[^0-9]/g, '');
  const input = e.target;
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const currentVal = input.value;
  const maxLen = parseInt(input.getAttribute('maxlength') || '15', 10);
  const newVal = (currentVal.substring(0, start) + numbersOnly + currentVal.substring(end)).slice(0, maxLen);
  input.value = newVal;
  const newPos = Math.min(start + numbersOnly.length, newVal.length);
  input.setSelectionRange(newPos, newPos);
  input.dispatchEvent(new Event('input', { bubbles: true }));
});

// 5. Intercept drag-and-drop
document.addEventListener('drop', (e) => {
  if (!isPhoneOrNumberInput(e.target)) return;
  e.preventDefault();
});

