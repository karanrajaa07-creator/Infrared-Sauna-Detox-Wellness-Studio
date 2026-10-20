/**
 * Aura & Solace - Dark Mode & RTL / LTR Engine
 * Provides persistent theme (Light/Dark) and direction (LTR/RTL) switching
 * with instant load prevention (zero FOUC) and synchronized UI controls.
 */

(function () {
  'use strict';

  // 1. Core State Retrieval with Fallback Safety
  function getStoredTheme() {
    try {
      const theme = localStorage.getItem('aura_theme');
      if (theme === 'dark' || theme === 'light') return theme;
      // Optional: check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.warn('LocalStorage inaccessible:', e);
    }
    return 'light';
  }

  function getStoredDir() {
    try {
      const dir = localStorage.getItem('aura_dir');
      if (dir === 'rtl' || dir === 'ltr') return dir;
    } catch (e) {
      console.warn('LocalStorage inaccessible:', e);
    }
    return 'ltr';
  }

  // 2. Immediate Attribute Application (Runs before full DOM parse)
  function applyThemeImmediate(theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }

  function applyDirImmediate(dir) {
    const root = document.documentElement;
    root.setAttribute('dir', dir);
    if (dir === 'rtl') {
      root.classList.add('rtl-mode');
    } else {
      root.classList.remove('rtl-mode');
    }
  }

  // Initial early apply
  const initialTheme = getStoredTheme();
  const initialDir = getStoredDir();
  applyThemeImmediate(initialTheme);
  applyDirImmediate(initialDir);

  // 3. Global Public Controller Object
  window.AuraDisplay = {
    currentTheme: initialTheme,
    currentDir: initialDir,

    setTheme: function (theme, notify = true) {
      if (theme !== 'dark' && theme !== 'light') return;
      this.currentTheme = theme;
      try {
        localStorage.setItem('aura_theme', theme);
      } catch (e) {}

      applyThemeImmediate(theme);
      this.updateUI();

      window.dispatchEvent(new CustomEvent('auraThemeChange', { detail: { theme } }));

      if (notify && typeof Toast !== 'undefined' && Toast.info) {
        Toast.info(theme === 'dark' ? 'Dark Mode activated 🌙' : 'Light Mode activated ☀️');
      }
    },

    toggleTheme: function (notify = true) {
      const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(nextTheme, notify);
      return nextTheme;
    },

    setDir: function (dir, notify = true) {
      if (dir !== 'rtl' && dir !== 'ltr') return;
      this.currentDir = dir;
      try {
        localStorage.setItem('aura_dir', dir);
      } catch (e) {}

      applyDirImmediate(dir);
      this.updateUI();

      window.dispatchEvent(new CustomEvent('auraDirChange', { detail: { dir } }));

      if (notify && typeof Toast !== 'undefined' && Toast.info) {
        Toast.info(dir === 'rtl' ? 'Switched to RTL layout (Right-to-Left) ⇄' : 'Switched to LTR layout (Left-to-Right) ⇄');
      }
    },

    toggleDir: function (notify = true) {
      const nextDir = this.currentDir === 'rtl' ? 'ltr' : 'rtl';
      this.setDir(nextDir, notify);
      return nextDir;
    },

    // Synchronize all icons, badges, titles and labels
    updateUI: function () {
      const isDark = this.currentTheme === 'dark';
      const isRtl = this.currentDir === 'rtl';

      // 1. Update all Theme Toggles (Navbar)
      const themeButtons = document.querySelectorAll('.btn-theme-toggle, [data-action="toggle-theme"]');
      themeButtons.forEach(btn => {
        btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');

        // Look for internal icon elements
        const icon = btn.querySelector('.theme-icon-indicator') || btn.querySelector('i');
        if (icon) {
          icon.className = isDark
            ? 'bi bi-sun-fill theme-icon-indicator text-warning'
            : 'bi bi-moon-stars-fill theme-icon-indicator';
        }

        const label = btn.querySelector('.theme-label-text');
        if (label) {
          label.textContent = isDark ? 'Light' : 'Dark';
        }
      });

      // 2. Update all Direction Toggles (Navbar)
      const dirButtons = document.querySelectorAll('.btn-dir-toggle, [data-action="toggle-dir"]');
      dirButtons.forEach(btn => {
        btn.setAttribute('aria-label', isRtl ? 'Switch to LTR layout' : 'Switch to RTL layout');
        btn.setAttribute('title', isRtl ? 'Switch to LTR (Left-to-Right)' : 'Switch to RTL (Right-to-Left)');

        const dirBadge = btn.querySelector('.dir-pill-switch, .dir-badge');
        if (dirBadge) {
          dirBadge.textContent = isRtl ? 'RTL' : 'LTR';
        }
      });
    },

    // Remove any leftover floating switcher if present
    removeFloatingSwitcher: function () {
      const existing = document.getElementById('aura-floating-switcher');
      if (existing) {
        existing.remove();
      }
    }
  };

  // 4. Global Aliases for convenient onclick use
  window.toggleTheme = function () {
    return window.AuraDisplay.toggleTheme();
  };

  window.toggleDir = function () {
    return window.AuraDisplay.toggleDir();
  };

  // 5. Initialize once DOM is ready
  function initDOM() {
    window.AuraDisplay.removeFloatingSwitcher();
    window.AuraDisplay.updateUI();

    // Event delegation for clicks on any theme or dir button
    document.addEventListener('click', function (e) {
      const themeBtn = e.target.closest('.btn-theme-toggle, [data-action="toggle-theme"]');
      if (themeBtn) {
        e.preventDefault();
        window.AuraDisplay.toggleTheme();
        return;
      }

      const dirBtn = e.target.closest('.btn-dir-toggle, [data-action="toggle-dir"]');
      if (dirBtn) {
        e.preventDefault();
        window.AuraDisplay.toggleDir();
        return;
      }
    });

    // Cross-tab synchronization
    window.addEventListener('storage', function (e) {
      if (e.key === 'aura_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        window.AuraDisplay.setTheme(e.newValue, false);
      }
      if (e.key === 'aura_dir' && (e.newValue === 'ltr' || e.newValue === 'rtl')) {
        window.AuraDisplay.setDir(e.newValue, false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOM);
  } else {
    initDOM();
  }
})();
