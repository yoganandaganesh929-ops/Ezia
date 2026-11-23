/**
 * ==========================================================================
 * EZIA LANDING PAGE BEHAVIOR (index.js)
 * Clean, lightweight vanilla JS for date formatting & active session handling.
 * Zero fabricated data seeding.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Format today's date in preview card
  const dateEl = document.getElementById('heroLiveDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = 'Today, ' + now.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  }

  // Guest Mode Entry Handlers
  const guestBtns = [document.getElementById('heroGuestBtn'), document.getElementById('navGuestBtn')];
  guestBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (typeof Ezia !== 'undefined' && Ezia.Auth && !Ezia.Auth.isAuthenticated()) {
          Ezia.Auth.loginAsGuest();
        }
      });
    }
  });

  // If user has an active genuine session, personalize hero call-to-action
  if (typeof Ezia !== 'undefined' && Ezia.Auth) {
    const user = Ezia.Auth.getCurrentUser();
    if (user && user.name) {
      const heroCta = document.querySelector('.hero-cta-group .btn-primary');
      if (heroCta) {
        heroCta.innerHTML = `<span>Resume Session, ${user.name} &rarr;</span>`;
        heroCta.href = './dashboard.html';
      }
      const secondaryCta = document.querySelector('.hero-cta-group .btn-secondary');
      if (secondaryCta) {
        secondaryCta.style.display = 'none';
      }
    }
  }
});
