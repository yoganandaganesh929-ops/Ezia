/**
 * ==========================================================================
 * EZIA HYDRATION PAGE BEHAVIOR (hydration.js)
 * Clean, production-ready fluid tracker connected to Ezia.Auth.
 * User-isolated data persistence, zero fake logs, responsive vessel.
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
  const waterGoal = profile.waterGoalMl || 2500;

  // Sidebar profile info
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

  const totalWaterText = document.getElementById('totalWaterText');
  const waterGoalSummary = document.getElementById('waterGoalSummary');
  const waterRemainingText = document.getElementById('waterRemainingText');
  const liquidWaveFill = document.getElementById('liquidWaveFill');
  const hydrationStatusBadge = document.getElementById('hydrationStatusBadge');
  const logsListContainer = document.getElementById('hydrationLogsList');
  const customWaterForm = document.getElementById('customWaterForm');
  const customAmountInput = document.getElementById('customAmountInput');
  const undoLastBtn = document.getElementById('undoLastWaterBtn');

  // Date Header
  const dateBadge = document.getElementById('hydrationDateBadge');
  if (dateBadge) {
    dateBadge.textContent = new Date().toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  // 1. One-Click Quick-Add Buttons
  const quickBtns = document.querySelectorAll('.quick-btn');
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const ml = parseInt(btn.getAttribute('data-ml'), 10);
      if (ml > 0) {
        Ezia.Storage.addHydrationEntry(ml);
        Ezia.showToast(`Logged +${ml} ml water`, 'success');
        renderHydrationView();
      }
    });
  });

  // 2. Custom Water Form Submit
  if (customWaterForm) {
    customWaterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseInt(customAmountInput.value, 10);
      if (val && val > 0) {
        Ezia.Storage.addHydrationEntry(val);
        Ezia.showToast(`Logged +${val} ml water`, 'success');
        customAmountInput.value = '';
        renderHydrationView();
      }
    });
  }

  // 3. Undo Last Entry
  if (undoLastBtn) {
    undoLastBtn.addEventListener('click', () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLogs = Ezia.Storage.getHydrationLogs().filter(item => item.date === todayStr);
      if (todayLogs.length > 0) {
        Ezia.Storage.deleteHydrationEntry(todayLogs[0].id);
        Ezia.showToast('Undid last water entry', 'info');
        renderHydrationView();
      } else {
        Ezia.showToast('No entries to undo for today', 'info');
      }
    });
  }

  // 4. Render Hydration View
  renderHydrationView();

  function renderHydrationView() {
    const todayStr = new Date().toISOString().split('T')[0];
    const allLogs = Ezia.Storage.getHydrationLogs();
    const todayLogs = allLogs.filter(item => item.date === todayStr);

    const totalLogged = todayLogs.reduce((sum, item) => sum + item.amountMl, 0);
    const percent = Math.min(100, Math.round((totalLogged / waterGoal) * 100));
    const remaining = Math.max(0, waterGoal - totalLogged);

    // Text updates
    if (totalWaterText) totalWaterText.textContent = totalLogged.toLocaleString();
    if (waterGoalSummary) {
      waterGoalSummary.textContent = `${percent}% of your ${waterGoal.toLocaleString()} ml personal target`;
    }
    if (waterRemainingText) {
      waterRemainingText.textContent = remaining > 0 ? `${remaining.toLocaleString()} ml` : 'Goal achieved!';
    }

    // Liquid Fill Height
    if (liquidWaveFill) {
      if (totalLogged === 0) {
        liquidWaveFill.style.height = '0%';
      } else {
        liquidWaveFill.style.height = `${Math.max(10, percent)}%`;
      }
    }

    // Status Badge
    if (hydrationStatusBadge) {
      if (totalLogged === 0) {
        hydrationStatusBadge.textContent = 'Awaiting Intake';
        hydrationStatusBadge.className = 'badge badge-amber';
      } else if (percent >= 100) {
        hydrationStatusBadge.textContent = 'Target Achieved';
        hydrationStatusBadge.className = 'badge badge-mint';
      } else if (percent >= 50) {
        hydrationStatusBadge.textContent = 'On Track';
        hydrationStatusBadge.className = 'badge badge-teal';
      } else {
        hydrationStatusBadge.textContent = 'In Progress';
        hydrationStatusBadge.className = 'badge badge-amber';
      }
    }

    // Render Logs List
    if (logsListContainer) {
      if (todayLogs.length === 0) {
        logsListContainer.innerHTML = `
          <div style="text-align: center; padding: 48px 16px;">
            <img src="./assets/illustrations/empty-state.svg" alt="No water logged yet" style="width: 110px; margin: 0 auto 12px auto; opacity: 0.85;">
            <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 6px;">No water intake logged yet today.</p>
            <p class="text-secondary" style="font-size: 0.8rem; margin: 0;">Use the quick presets or custom form to log your first fluid entry.</p>
          </div>
        `;
        return;
      }

      logsListContainer.innerHTML = todayLogs.map(item => `
        <div class="log-item" id="item_${item.id}">
          <div class="log-item-left">
            <span style="font-size: 18px;">💧</span>
            <div>
              <span class="log-water-amount">+${item.amountMl} ml</span>
              <div class="log-water-time">${item.time}</div>
            </div>
          </div>
          <button type="button" class="btn-delete-log" data-id="${item.id}" title="Delete entry" aria-label="Delete entry of ${item.amountMl} ml">
            &times;
          </button>
        </div>
      `).join('');

      // Attach delete handlers
      const delBtns = logsListContainer.querySelectorAll('.btn-delete-log');
      delBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          Ezia.Storage.deleteHydrationEntry(id);
          Ezia.showToast('Entry removed', 'info');
          renderHydrationView();
        });
      });
    }
  }
});
