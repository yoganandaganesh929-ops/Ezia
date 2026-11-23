/**
 * ==========================================================================
 * EZIA SETTINGS PAGE BEHAVIOR (settings.js)
 * Clean, production-ready preferences & privacy controls connected to Ezia.Auth.
 * User-isolated data management, genuine account deletion, zero demo seeding.
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

  const profileForm = document.getElementById('profileSettingsForm');
  const targetsForm = document.getElementById('targetsSettingsForm');

  const nameInput = document.getElementById('setProfileName');
  const emailInput = document.getElementById('setProfileEmail');
  const ageInput = document.getElementById('setProfileAge');
  const genderSelect = document.getElementById('setProfileGender');
  const unitSelect = document.getElementById('setUnitPref');

  const waterGoalInput = document.getElementById('setWaterGoal');
  const sleepGoalInput = document.getElementById('setSleepGoal');

  const exportBtn = document.getElementById('exportDataBtn');
  const printBtn = document.getElementById('settingsPrintBtn');
  const clearLogsBtn = document.getElementById('clearLogsBtn');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');

  // Load Existing Profile Values
  if (nameInput) nameInput.value = (user && user.name) || profile.name || '';
  if (emailInput) emailInput.value = (user && user.email) || profile.email || '';
  if (ageInput) ageInput.value = profile.age || 28;
  if (genderSelect) genderSelect.value = profile.gender || 'female';
  if (unitSelect) unitSelect.value = profile.unitPreference || 'metric';

  if (waterGoalInput) waterGoalInput.value = profile.waterGoalMl || 2500;
  if (sleepGoalInput) sleepGoalInput.value = profile.sleepGoalHrs || 8;

  // 1. Profile Form Save
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = Ezia.Storage.getProfile();
      const newName = nameInput.value.trim() || 'Member';
      const newEmail = emailInput.value.trim();

      updated.name = newName;
      updated.email = newEmail;
      updated.age = parseInt(ageInput.value, 10) || 28;
      updated.gender = genderSelect.value;
      updated.unitPreference = unitSelect.value;

      Ezia.Storage.saveProfile(updated);

      // Update session user if available
      const session = Ezia.Storage.getSession();
      if (session && session.user) {
        session.user.name = newName;
        session.user.email = newEmail;
        session.user.age = updated.age;
        session.user.gender = updated.gender;
        session.user.unitPreference = updated.unitPreference;
        localStorage.setItem(Ezia.Storage.KEYS.SESSION, JSON.stringify(session));
      }

      Ezia.showToast('Profile calibration updated successfully.', 'success');

      if (sidebarUserName) sidebarUserName.textContent = newName;
      if (sidebarAvatar) {
        sidebarAvatar.textContent = newName
          .split(' ')
          .filter(Boolean)
          .map(part => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'EZ';
      }
    });
  }

  // 2. Targets Form Save
  if (targetsForm) {
    targetsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = Ezia.Storage.getProfile();
      updated.waterGoalMl = parseInt(waterGoalInput.value, 10) || 2500;
      updated.sleepGoalHrs = parseFloat(sleepGoalInput.value) || 8.0;

      Ezia.Storage.saveProfile(updated);
      Ezia.showToast('Daily habit targets saved.', 'success');
    });
  }

  // 3. Export Data (Download JSON file)
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = Ezia.Storage.exportAllJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const nowStr = new Date().toISOString().split('T')[0];
      const safeName = ((user && user.name) || 'ezia').toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.href = url;
      a.download = `ezia_${safeName}_wellness_backup_${nowStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Ezia.showToast('Export file created and downloaded.', 'success');
    });
  }

  // 4. Print Report
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // 5. Clear Personal Logs Only
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      const confirmed = window.confirm('Are you sure you want to clear your recorded hydration, sleep, and body metric logs? Your profile calibration and targets will be preserved.');
      if (confirmed) {
        const uId = Ezia.Storage.getActiveUserId();
        if (uId) {
          localStorage.removeItem(`ezia_u_${uId}_hydration_v2`);
          localStorage.removeItem(`ezia_u_${uId}_sleep_v2`);
          localStorage.removeItem(`ezia_u_${uId}_metrics_v2`);
        }
        Ezia.showToast('All personal activity logs cleared.', 'info');
      }
    });
  }

  // 6. Delete Profile & Account
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
      const isGuestMode = user && user.isGuest;
      const promptText = isGuestMode 
        ? 'Are you sure you want to reset your Guest session and clear all recorded data?'
        : 'CRITICAL ACTION: Are you sure you want to permanently delete your account and all associated biological logs? This action is immediate and cannot be undone.';
      
      const confirmed = window.confirm(promptText);
      if (confirmed) {
        if (isGuestMode) {
          const uId = Ezia.Storage.getActiveUserId();
          Ezia.Storage.clearUserData(uId);
          Ezia.Auth.logout();
          Ezia.showToast('Guest session and logs cleared.', 'info');
        } else if (user && user.id) {
          Ezia.Auth.deleteAccount();
          Ezia.showToast('Account and all associated records permanently purged.', 'info');
        }
        setTimeout(() => {
          window.location.href = './index.html';
        }, 800);
      }
    });
  }
});
