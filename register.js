/**
 * ==========================================================================
 * EZIA REGISTRATION PAGE BEHAVIOR (register.js)
 * Clean, production-ready registration connected to Ezia.Auth.
 * Web Crypto SHA-256 salted credentials & isolated user profile storage.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const nameInput = document.getElementById('regName');
  const emailInput = document.getElementById('regEmail');
  const ageInput = document.getElementById('regAge');
  const genderInput = document.getElementById('regGender');
  const unitsInput = document.getElementById('regUnits');
  const passwordInput = document.getElementById('regPassword');
  const termsCheck = document.getElementById('termsCheck');
  const statusEl = document.getElementById('registerStatus');
  const submitBtn = document.getElementById('regSubmitBtn');

  // 1-Click Guest Mode from registration page
  const registerGuestBtn = document.getElementById('registerGuestBtn');
  if (registerGuestBtn) {
    registerGuestBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof Ezia !== 'undefined' && Ezia.Auth) {
        Ezia.Auth.loginAsGuest();
      }
      window.location.href = './dashboard.html';
    });
  }

  // If already logged in, show status or let them continue
  if (typeof Ezia !== 'undefined' && Ezia.Auth && Ezia.Auth.isAuthenticated()) {
    const user = Ezia.Auth.getCurrentUser();
    if (user && statusEl) {
      statusEl.textContent = `You are currently signed in as ${user.name} (${user.email}).`;
      statusEl.className = 'status-message status-info';
      statusEl.style.display = 'block';
    }
  }

  // Clear errors on input
  [nameInput, emailInput, ageInput, passwordInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        inp.classList.remove('is-invalid');
        const err = document.getElementById(inp.id.replace('reg', '').toLowerCase() + 'Error');
        if (err) err.style.display = 'none';
        if (statusEl) statusEl.style.display = 'none';
      });
    }
  });

  if (termsCheck) {
    termsCheck.addEventListener('change', () => {
      const tErr = document.getElementById('termsError');
      if (tErr) tErr.style.display = 'none';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const age = parseInt(ageInput.value, 10);
    const password = passwordInput.value;

    if (!name) {
      showError(nameInput, 'nameError', 'Please enter your full name.');
      isValid = false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(emailInput, 'emailError', 'Please enter a valid email address.');
      isValid = false;
    }

    if (isNaN(age) || age < 12 || age > 120) {
      showError(ageInput, 'ageError', 'Please enter an age between 12 and 120.');
      isValid = false;
    }

    if (!password || password.length < 8) {
      showError(passwordInput, 'passwordError', 'Password must be at least 8 characters long.');
      isValid = false;
    }

    if (!termsCheck.checked) {
      const tErr = document.getElementById('termsError');
      if (tErr) {
        tErr.textContent = 'Please confirm agreement with the Terms of Service & Private Health Data Policy.';
        tErr.style.display = 'block';
      }
      isValid = false;
    }

    if (!isValid) {
      statusEl.textContent = 'Please correct the highlighted fields before proceeding.';
      statusEl.className = 'status-message status-error';
      statusEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Creating secure profile...</span>';

    try {
      const result = await Ezia.Auth.register({
        name,
        email,
        password,
        age,
        gender: genderInput ? genderInput.value : 'female',
        unitPreference: unitsInput ? unitsInput.value : 'metric'
      });

      if (!result.success) {
        statusEl.textContent = result.error || result.message || 'Registration failed. Please try again.';
        statusEl.className = 'status-message status-error';
        statusEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Profile &amp; Go to Dashboard &rarr;</span>';
        return;
      }

      statusEl.textContent = 'Profile created successfully! Initializing your private wellness space...';
      statusEl.className = 'status-message status-success';
      statusEl.style.display = 'block';

      setTimeout(() => {
        window.location.href = './dashboard.html';
      }, 750);
    } catch (err) {
      console.error('Registration exception:', err);
      statusEl.textContent = 'An unexpected error occurred during profile registration. Please check browser console.';
      statusEl.className = 'status-message status-error';
      statusEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Create Profile &amp; Go to Dashboard &rarr;</span>';
    }
  });

  function showError(input, errorId, msg) {
    input.classList.add('is-invalid');
    const el = document.getElementById(errorId);
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }
});
