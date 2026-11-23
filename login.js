/**
 * ==========================================================================
 * EZIA LOGIN PAGE BEHAVIOR (login.js)
 * Genuine authentication with Web Crypto SHA-256 password hash comparison.
 * Zero demo accounts, zero simulated credentials.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const statusMessage = document.getElementById('statusMessage');
  const submitBtn = document.getElementById('submitBtn');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');

  // Check if redirect query param exists
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTarget = urlParams.get('redirect') || 'dashboard.html';

  // 1. Password Visibility Toggle
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPass = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPass ? 'text' : 'password');
      togglePasswordBtn.setAttribute('aria-label', isPass ? 'Hide password' : 'Show password');
      const eyeSymbol = togglePasswordBtn.querySelector('.eye-symbol');
      if (eyeSymbol) {
        eyeSymbol.textContent = isPass ? '🙈' : '👁️';
      }
    });
  }

  // 2. Forgot Password Genuine Assistance
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof Ezia !== 'undefined' && Ezia.showToast) {
        Ezia.showToast('In standalone mode, passwords cannot be recovered via email. You may create a new profile on the registration page.', 'info');
      } else {
        alert('In standalone client-side mode, passwords cannot be recovered via email. You may create a new profile on the registration page.');
      }
    });
  }

  // 2B. Instant Guest Mode Access (No Credentials Required)
  const guestLoginBtn = document.getElementById('guestLoginBtn');
  if (guestLoginBtn) {
    guestLoginBtn.addEventListener('click', () => {
      if (typeof Ezia !== 'undefined' && Ezia.Auth) {
        Ezia.Auth.loginAsGuest();
        if (Ezia.showToast) Ezia.showToast('Entering Ezia as Guest Explorer...', 'success');
      }
      setTimeout(() => {
        window.location.href = `./${redirectTarget}`;
      }, 350);
    });
  }

  // 3. Clear errors on input
  if (emailInput) {
    emailInput.addEventListener('input', () => clearError(emailInput, emailError));
  }
  if (passwordInput) {
    passwordInput.addEventListener('input', () => clearError(passwordInput, passwordError));
  }

  // 4. Form Submit & Genuine Verification
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAllErrors();
      hideStatus();

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      let isValid = true;

      if (!email) {
        setError(emailInput, emailError, 'Email address is required.');
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(emailInput, emailError, 'Please enter a valid email address.');
        isValid = false;
      }

      if (!password) {
        setError(passwordInput, passwordError, 'Password is required.');
        isValid = false;
      }

      if (!isValid) {
        showStatus('Please correct the highlighted fields.', 'error');
        return;
      }

      // Set loading state
      submitBtn.disabled = true;
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Verifying credentials...</span>';

      try {
        if (typeof Ezia === 'undefined' || !Ezia.Auth) {
          throw new Error('Authentication service unavailable.');
        }

        const result = await Ezia.Auth.login(email, password);

        if (!result.success) {
          showStatus(result.error || 'Authentication failed. Please verify your credentials.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
          return;
        }

        showStatus(`Welcome back, ${result.user.name}. Loading your sanctuary...`, 'success');

        setTimeout(() => {
          window.location.href = `./${redirectTarget}`;
        }, 500);

      } catch (err) {
        showStatus('Authentication error: ' + err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }

  function setError(inputEl, errorEl, msg) {
    inputEl.classList.add('is-invalid');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  function clearError(inputEl, errorEl) {
    inputEl.classList.remove('is-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  function clearAllErrors() {
    clearError(emailInput, emailError);
    clearError(passwordInput, passwordError);
  }

  function showStatus(msg, type) {
    if (!statusMessage) return;
    statusMessage.textContent = msg;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';
  }

  function hideStatus() {
    if (!statusMessage) return;
    statusMessage.style.display = 'none';
  }
});
