/**
 * ==========================================================================
 * EZIA SUBSCRIPTION PAGE BEHAVIOR (subscription.js)
 * Handles guest mode redirect, Pro upgrade modal, and notify-me flow.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── Guest Mode Link ──────────────────────────────────────────────────────
  const guestModeLink = document.getElementById('guestModeLink');
  if (guestModeLink) {
    guestModeLink.addEventListener('click', (e) => {
      e.preventDefault();
      // Set guest session via Ezia.Auth if available
      if (typeof Ezia !== 'undefined' && Ezia.Auth) {
        Ezia.Auth.loginAsGuest();
      }
      window.location.href = './dashboard.html';
    });
  }

  // ── Pro Upgrade Button → Modal ───────────────────────────────────────────
  const proUpgradeBtn = document.getElementById('proUpgradeBtn');
  const proModal = document.getElementById('proModal');
  const modalClose = document.getElementById('modalClose');
  const proNotifyBtn = document.getElementById('proNotifyBtn');
  const proEmailInput = document.getElementById('proEmailInput');

  function openModal() {
    if (proModal) {
      proModal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      if (proEmailInput) proEmailInput.focus();
    }
  }

  function closeModal() {
    if (proModal) {
      proModal.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
  }

  if (proUpgradeBtn) {
    proUpgradeBtn.addEventListener('click', openModal);
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (proModal) {
    proModal.addEventListener('click', (e) => {
      if (e.target === proModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ── Notify Me Flow ───────────────────────────────────────────────────────
  if (proNotifyBtn && proEmailInput) {
    proNotifyBtn.addEventListener('click', () => {
      const email = proEmailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        proEmailInput.style.borderColor = 'var(--color-error)';
        proEmailInput.focus();
        return;
      }
      proEmailInput.style.borderColor = '';

      // Store locally (no backend in standalone mode)
      const existing = JSON.parse(localStorage.getItem('ezia_pro_waitlist') || '[]');
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem('ezia_pro_waitlist', JSON.stringify(existing));
      }

      // Show confirmation
      const modalCard = document.querySelector('.modal-card');
      if (modalCard) {
        modalCard.innerHTML = `
          <div style="text-align:center;padding:20px 0;">
            <div style="font-size:2.5rem;margin-bottom:16px;">🎉</div>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--color-text-primary);margin-bottom:10px;">You're on the list!</h2>
            <p style="font-size:0.9rem;color:var(--color-text-secondary);line-height:1.6;font-family:'Plus Jakarta Sans',sans-serif;">
              We'll notify <strong>${email}</strong> the moment Ezia Pro launches.<br>Your personal AI doctor is on the way.
            </p>
            <button class="btn btn-primary" style="margin-top:24px;" onclick="document.getElementById('proModal').setAttribute('hidden','');document.body.style.overflow='';">Close</button>
          </div>
        `;
      }
    });
  }

  // ── Highlight current plan if user is logged in ──────────────────────────
  if (typeof Ezia !== 'undefined' && Ezia.Auth && Ezia.Auth.isAuthenticated()) {
    const user = Ezia.Auth.getCurrentUser();
    if (user && !user.isGuest) {
      // Mark free card as current plan
      const freeCta = document.querySelector('#cardFree .plan-cta-area .btn');
      if (freeCta) {
        freeCta.textContent = '✓ Your Current Plan';
        freeCta.classList.remove('btn-secondary');
        freeCta.classList.add('btn-ghost');
        freeCta.style.pointerEvents = 'none';
      }
    }
  }
});
