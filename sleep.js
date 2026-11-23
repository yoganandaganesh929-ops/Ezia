/**
 * ==========================================================================
 * EZIA SLEEP TRACKER BEHAVIOR (sleep.js)
 * Production-ready circadian rest tracker connected to Ezia.Auth.
 * User-isolated data persistence, zero fake logs, live cross-midnight math.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof Ezia === 'undefined') return;

  // Ensure session (defaults seamlessly to Guest Mode without credentials or sign-up)
  if (!Ezia.Auth.isAuthenticated()) {
    Ezia.Auth.loginAsGuest();
  }

  // Initialize mobile sidebar drawer
  Ezia.initMobileSidebar();

  const user = Ezia.Auth.getCurrentUser();
  const profile = Ezia.Storage.getProfile();
  const isGuest = user && user.isGuest;

  // Populate sidebar user info
  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const activeName = (user && user.name) || profile.name || (isGuest ? 'Guest Explorer' : 'Member');
  if (sidebarUserName) sidebarUserName.textContent = activeName;
  if (sidebarAvatar) {
    const initials = isGuest ? 'GE' : (activeName
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'EZ');
    sidebarAvatar.textContent = initials;
  }

  const bedtimeInput = document.getElementById('bedtimeInput');
  const wakeTimeInput = document.getElementById('wakeTimeInput');
  const durationBadge = document.getElementById('calculatedDurationBadge');
  const starRatingPicker = document.getElementById('starRatingPicker');
  const ratingDescriptor = document.getElementById('ratingDescriptor');
  const sleepNotesInput = document.getElementById('sleepNotesInput');
  const sleepForm = document.getElementById('sleepForm');
  const heroSleepDuration = document.getElementById('heroSleepDuration');
  const heroSleepSchedule = document.getElementById('heroSleepSchedule');
  const sleepHistoryTableBody = document.getElementById('sleepHistoryTableBody');
  const dateBadge = document.getElementById('sleepDateBadge');

  let currentRating = 4;
  const ratingLabels = {
    1: 'Restless',
    2: 'Fair',
    3: 'Moderate',
    4: 'Restful',
    5: 'Rejuvenated'
  };

  // Date Header
  if (dateBadge) {
    dateBadge.textContent = new Date().toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  // 1. Live Duration Calculation on Time Change
  [bedtimeInput, wakeTimeInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', updateDurationPreview);
    }
  });

  function updateDurationPreview() {
    const bedtime = bedtimeInput ? bedtimeInput.value : '';
    const wakeTime = wakeTimeInput ? wakeTimeInput.value : '';
    if (bedtime && wakeTime && durationBadge) {
      const dur = Ezia.Calc.calculateSleepDuration(bedtime, wakeTime);
      durationBadge.textContent = `${dur.toFixed(1)} hrs`;
    }
  }
  updateDurationPreview();

  // 2. Interactive Star Rating Selector
  if (starRatingPicker) {
    const starBtns = starRatingPicker.querySelectorAll('.star-btn');
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.getAttribute('data-rating'), 10);
        setRating(rating);
      });
    });
  }

  function setRating(rating) {
    currentRating = rating;
    if (starRatingPicker) {
      const starBtns = starRatingPicker.querySelectorAll('.star-btn');
      starBtns.forEach(btn => {
        const val = parseInt(btn.getAttribute('data-rating'), 10);
        if (val <= rating) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    if (ratingDescriptor) {
      ratingDescriptor.innerHTML = `Rating: <strong>${rating} / 5 &mdash; ${ratingLabels[rating]}</strong>`;
    }
  }

  // 3. Form Submission
  if (sleepForm) {
    sleepForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const bedtime = bedtimeInput ? bedtimeInput.value : '';
      const wakeTime = wakeTimeInput ? wakeTimeInput.value : '';
      const notes = sleepNotesInput ? sleepNotesInput.value.trim() : '';

      if (!bedtime || !wakeTime) {
        Ezia.showToast('Please provide both bedtime and wake time.', 'error');
        return;
      }

      const entry = Ezia.Storage.addSleepEntry({
        bedtime: bedtime,
        wakeTime: wakeTime,
        restfulness: currentRating,
        notes: notes
      });

      Ezia.showToast(`Logged ${entry.durationHours} hrs of sleep to your record`, 'success');
      if (sleepNotesInput) sleepNotesInput.value = '';
      renderSleepView();
    });
  }

  // 4. Render Sleep View & Table
  renderSleepView();

  function renderSleepView() {
    const logs = Ezia.Storage.getSleepLogs();

    // Summary Hero
    if (logs.length > 0) {
      const latest = logs[0];
      if (heroSleepDuration) heroSleepDuration.textContent = latest.durationHours;
      if (heroSleepSchedule) {
        heroSleepSchedule.textContent = `${latest.bedtime} → ${latest.wakeTime} · Rated ${latest.restfulness}/5 (${latest.date})`;
      }
    } else {
      if (heroSleepDuration) heroSleepDuration.textContent = '—';
      if (heroSleepSchedule) heroSleepSchedule.textContent = 'No sleep records logged yet.';
    }

    // History Table
    if (sleepHistoryTableBody) {
      if (logs.length === 0) {
        sleepHistoryTableBody.innerHTML = `<tr><td colspan="7" class="text-muted" style="text-align:center; padding: 24px;">No recorded sleep entries yet.</td></tr>`;
        return;
      }

      sleepHistoryTableBody.innerHTML = logs.map(item => {
        const stars = '★'.repeat(item.restfulness) + '☆'.repeat(5 - item.restfulness);
        return `
          <tr>
            <td><strong>${item.date}</strong></td>
            <td>${item.bedtime}</td>
            <td>${item.wakeTime}</td>
            <td><strong>${item.durationHours} hrs</strong></td>
            <td><span style="color: #F59E0B;">${stars}</span> <small>(${ratingLabels[item.restfulness] || item.restfulness})</small></td>
            <td>${item.notes || '<span class="text-muted">—</span>'}</td>
            <td>
              <button type="button" class="btn-delete-sleep" data-id="${item.id}" title="Delete record" aria-label="Delete sleep record">
                &times;
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Attach delete handlers
      const delBtns = sleepHistoryTableBody.querySelectorAll('.btn-delete-sleep');
      delBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          Ezia.Storage.deleteSleepEntry(id);
          Ezia.showToast('Sleep record deleted', 'info');
          renderSleepView();
        });
      });
    }
  }
});
