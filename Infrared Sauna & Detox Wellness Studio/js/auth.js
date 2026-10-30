/**
 * AURA & SOLACE - Authentication Handlers
 * Login, Register, Forgot Password, Reset Password, Password Toggles
 */

document.addEventListener('DOMContentLoaded', () => {
  setupPasswordVisibilityToggles();
  setupLoginForm();
  setupRegisterForm();
  setupForgotPasswordForm();
  setupResetPasswordForm();
  checkPresetQueryParams();
});

function setupPasswordVisibilityToggles() {
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
      }
    });
  });
}

function checkPresetQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const isAdmin = params.get('admin');
  const adminAlert = document.getElementById('admin-login-notice');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  if (isAdmin && adminAlert) {
    adminAlert.classList.remove('d-none');
    if (emailInput && !emailInput.value) emailInput.value = 'admin@solacesauna.com';
    if (passwordInput && !passwordInput.value) passwordInput.value = 'Admin@12345';
  }
}

function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const rememberCheckbox = document.getElementById('login-remember-me');
  const errorAlert = document.getElementById('login-error-alert');
  const submitBtn = document.getElementById('login-submit-btn') || form.querySelector('button[type="submit"]');

  const emailFeedback = document.getElementById('login-email-feedback');
  const passwordFeedback = document.getElementById('login-password-feedback');

  // Clear errors when user types
  function clearErrors() {
    if (errorAlert) {
      errorAlert.classList.add('d-none');
      errorAlert.textContent = '';
    }
    if (emailInput) emailInput.classList.remove('is-invalid');
    if (passwordInput) passwordInput.classList.remove('is-invalid');
  }

  if (emailInput) emailInput.addEventListener('input', clearErrors);
  if (passwordInput) passwordInput.addEventListener('input', clearErrors);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const rememberMe = rememberCheckbox ? rememberCheckbox.checked : true;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasValidationError = false;

    if (!email) {
      if (emailInput) emailInput.classList.add('is-invalid');
      if (emailFeedback) emailFeedback.textContent = "Please enter your email address.";
      hasValidationError = true;
    } else if (!emailRegex.test(email)) {
      if (emailInput) emailInput.classList.add('is-invalid');
      if (emailFeedback) emailFeedback.textContent = "Please enter a valid email address (e.g. name@example.com).";
      hasValidationError = true;
    }

    // Validate password
    if (!password) {
      if (passwordInput) passwordInput.classList.add('is-invalid');
      if (passwordFeedback) passwordFeedback.textContent = "Please enter your password.";
      hasValidationError = true;
    }

    if (hasValidationError) {
      if (errorAlert) {
        errorAlert.textContent = "Please provide a valid email and password.";
        errorAlert.classList.remove('d-none');
      }
      return;
    }

    // Proper loading state while submitting
    const originalBtn = submitBtn.innerHTML;
    submitBtn.disabled = true;
    if (emailInput) emailInput.disabled = true;
    if (passwordInput) passwordInput.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in...`;

    try {
      const res = await API.login(email, password, rememberMe);
      Toast.success(res.message || "Welcome back to Solace Sanctuary!");

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');

      setTimeout(() => {
        if (res.user && res.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else if (redirect) {
          window.location.href = redirect;
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 500);
    } catch (err) {
      console.warn("Login request failed:", err);
      let userMessage = err.message || "Invalid email or password. Please verify your credentials and try again.";

      if (errorAlert) {
        errorAlert.textContent = userMessage;
        errorAlert.classList.remove('d-none');
      }
      Toast.error(userMessage);

      submitBtn.disabled = false;
      if (emailInput) emailInput.disabled = false;
      if (passwordInput) passwordInput.disabled = false;
      submitBtn.innerHTML = originalBtn;
    }
  });
}

function setupRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const agreeTerms = document.getElementById('register-terms')?.checked;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!name || !email || !password) {
      Toast.error("Please complete all required fields.");
      return;
    }

    if (phone && !/^\d{7,15}$/.test(phone)) {
      Toast.error("Phone number must contain numbers only (7-15 digits).");
      return;
    }

    if (password.length < 6) {
      Toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      Toast.error("Passwords do not match.");
      return;
    }

    if (agreeTerms !== undefined && !agreeTerms) {
      Toast.warning("Please agree to the studio policies & terms.");
      return;
    }

    const originalBtn = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Creating Sanctuary Account...`;

    try {
      await API.register(name, email, password, phone);
      Toast.success("Account created successfully! Welcome to Aura & Solace.");

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    } catch (err) {
      Toast.error(err.message || "Registration failed. Email may already be registered.");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtn;
    }
  });
}

function setupForgotPasswordForm() {
  const form = document.getElementById('forgot-password-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!email) {
      Toast.error("Please enter your email address.");
      return;
    }

    const originalBtn = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Verifying...`;

    try {
      const res = await API.forgotPassword(email);
      Toast.success(res.message);

      const statusBox = document.getElementById('forgot-result-box');
      if (statusBox) {
        statusBox.classList.remove('d-none');
        statusBox.innerHTML = `
          <div class="alert alert-success">
            <strong>Password Reset Code Sent</strong>
            <p class="small mb-2 mt-1">If an account is associated with <strong>${email}</strong>, a reset link has been dispatched.</p>
            <div class="small bg-white p-2 rounded border">
              <strong>Demo Verification Code:</strong> <code>123456</code>
            </div>
            <a href="reset-password.html?email=${encodeURIComponent(email)}" class="btn btn-sm btn-aura-primary mt-3 w-100">
              Continue to Reset Password
            </a>
          </div>
        `;
      }
    } catch (err) {
      Toast.error(err.message || "Failed to initiate password reset.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtn;
    }
  });
}

function setupResetPasswordForm() {
  const form = document.getElementById('reset-password-form');
  if (!form) return;

  // Auto populate email from query string if present
  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get('email');
  const emailInput = document.getElementById('reset-email');
  if (emailParam && emailInput) {
    emailInput.value = emailParam;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value.trim();
    const code = document.getElementById('reset-code').value.trim();
    const newPassword = document.getElementById('reset-new-password').value;
    const confirmPassword = document.getElementById('reset-confirm-password').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!email || !newPassword) {
      Toast.error("Please complete all fields.");
      return;
    }

    if (newPassword.length < 6) {
      Toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.error("New passwords do not match.");
      return;
    }

    const originalBtn = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Updating Password...`;

    try {
      await API.resetPassword(email, newPassword, code);
      Toast.success("Password successfully reset! Please sign in with your new credentials.");

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    } catch (err) {
      Toast.error(err.message || "Failed to reset password.");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtn;
    }
  });
}
