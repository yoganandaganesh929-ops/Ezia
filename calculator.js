/**
 * ==========================================================================
 * EZIA CALCULATOR PAGE BEHAVIOR (calculator.js)
 * Production-ready anthropometric calculator with strict pediatric safety.
 * Mifflin-St Jeor formula & user-isolated persistence.
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

  const form = document.getElementById('calcForm');
  const unitMetricBtn = document.getElementById('unitMetricBtn');
  const unitImperialBtn = document.getElementById('unitImperialBtn');
  const metricInputFields = document.getElementById('metricInputFields');
  const imperialInputFields = document.getElementById('imperialInputFields');

  const heightCmInput = document.getElementById('heightCmInput');
  const weightKgInput = document.getElementById('weightKgInput');
  const heightFtInput = document.getElementById('heightFtInput');
  const heightInInput = document.getElementById('heightInInput');
  const weightLbsInput = document.getElementById('weightLbsInput');
  const ageInput = document.getElementById('ageInput');
  const genderSelect = document.getElementById('genderSelect');

  const resultBmiNum = document.getElementById('resultBmiNum');
  const resultBmrNum = document.getElementById('resultBmrNum');
  const resultCategoryBadge = document.getElementById('resultCategoryBadge');
  const resultCategoryText = document.getElementById('resultCategoryText');
  const needleLabel = document.getElementById('needleLabel');
  const pediatricWarningBanner = document.getElementById('pediatricWarningBanner');
  const metricsHistoryTableBody = document.getElementById('metricsHistoryTableBody');

  let currentUnit = profile.unitPreference || 'metric';

  // 1. Initial State from Profile
  if (profile) {
    if (profile.heightCm) heightCmInput.value = profile.heightCm;
    if (profile.weightKg) weightKgInput.value = profile.weightKg;
    if (profile.age) ageInput.value = profile.age;
    if (profile.gender) genderSelect.value = profile.gender;
    if (profile.heightCm && profile.weightKg) {
      syncMetricToImperial();
    }
    setUnitMode(currentUnit);
  }

  // 2. Unit Toggling (Metric <-> Imperial)
  if (unitMetricBtn && unitImperialBtn) {
    unitMetricBtn.addEventListener('click', () => {
      syncImperialToMetric();
      setUnitMode('metric');
    });

    unitImperialBtn.addEventListener('click', () => {
      syncMetricToImperial();
      setUnitMode('imperial');
    });
  }

  function setUnitMode(unit) {
    currentUnit = unit;
    if (unit === 'metric') {
      if (unitMetricBtn) unitMetricBtn.className = 'toggle-pill-btn active';
      if (unitImperialBtn) unitImperialBtn.className = 'toggle-pill-btn';
      if (metricInputFields) metricInputFields.style.display = 'block';
      if (imperialInputFields) imperialInputFields.style.display = 'none';
    } else {
      if (unitImperialBtn) unitImperialBtn.className = 'toggle-pill-btn active';
      if (unitMetricBtn) unitMetricBtn.className = 'toggle-pill-btn';
      if (metricInputFields) metricInputFields.style.display = 'none';
      if (imperialInputFields) imperialInputFields.style.display = 'block';
    }
  }

  function syncMetricToImperial() {
    const cm = parseFloat(heightCmInput.value);
    const kg = parseFloat(weightKgInput.value);
    if (!isNaN(cm) && cm > 0) {
      const { feet, inches } = Ezia.Calc.cmToFtIn(cm);
      heightFtInput.value = feet;
      heightInInput.value = inches;
    }
    if (!isNaN(kg) && kg > 0) {
      weightLbsInput.value = Ezia.Calc.kgToLbs(kg);
    }
  }

  function syncImperialToMetric() {
    const ft = parseFloat(heightFtInput.value);
    const inc = parseFloat(heightInInput.value) || 0;
    const lbs = parseFloat(weightLbsInput.value);
    if (!isNaN(ft) && ft > 0) {
      heightCmInput.value = Ezia.Calc.ftInToCm(ft, inc);
    }
    if (!isNaN(lbs) && lbs > 0) {
      weightKgInput.value = Ezia.Calc.lbsToKg(lbs);
    }
  }

  // 3. Form Submit / Calculate
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let heightCm = 0;
      let weightKg = 0;

      if (currentUnit === 'metric') {
        heightCm = parseFloat(heightCmInput.value);
        weightKg = parseFloat(weightKgInput.value);
      } else {
        heightCm = Ezia.Calc.ftInToCm(heightFtInput.value, heightInInput.value);
        weightKg = Ezia.Calc.lbsToKg(weightLbsInput.value);
        heightCmInput.value = heightCm;
        weightKgInput.value = weightKg;
      }

      const age = parseInt(ageInput.value, 10);
      const gender = genderSelect.value;

      if (!heightCm || isNaN(heightCm) || heightCm <= 0 || !weightKg || isNaN(weightKg) || weightKg <= 0 || !age || isNaN(age) || age <= 0) {
        Ezia.showToast('Please enter valid, positive measurements.', 'error');
        return;
      }

      // Save & Calculate through Ezia.Storage
      const entry = Ezia.Storage.saveBodyMetricEntry({
        weightKg,
        heightCm,
        age,
        gender
      });

      Ezia.showToast('Measurements calculated and saved to your private record.', 'success');
      renderResults(entry);
      renderHistoryTable();
    });
  }

  // 4. Render Results View
  function renderResults(entry) {
    const bmi = entry.bmi;
    const bmr = entry.bmr;
    const age = entry.age;

    if (resultBmiNum) resultBmiNum.textContent = bmi;
    if (needleLabel) needleLabel.textContent = `Your BMI: ${bmi}`;

    // Pediatric Boundary Check
    if (age < 18) {
      if (pediatricWarningBanner) pediatricWarningBanner.style.display = 'flex';
      if (resultCategoryBadge) {
        resultCategoryBadge.textContent = 'Pediatric Reference';
        resultCategoryBadge.className = 'badge badge-amber';
      }
      if (resultCategoryText) {
        resultCategoryText.textContent = 'Standard adult cutoffs do not apply to minors. Please refer to pediatrician percentile charts.';
      }
      if (resultBmrNum) resultBmrNum.textContent = 'N/A';
    } else {
      if (pediatricWarningBanner) pediatricWarningBanner.style.display = 'none';
      const cat = Ezia.Calc.getBMICategory(bmi, age);
      if (resultCategoryBadge) {
        resultCategoryBadge.textContent = cat.category;
        resultCategoryBadge.className = `badge ${cat.badgeClass}`;
      }
      if (resultCategoryText) resultCategoryText.textContent = cat.summary;
      if (resultBmrNum) resultBmrNum.textContent = (bmr || 0).toLocaleString();
    }
  }

  // 5. Render History Table
  function renderHistoryTable() {
    const list = Ezia.Storage.getBodyMetrics();
    if (!metricsHistoryTableBody) return;

    if (list.length === 0) {
      metricsHistoryTableBody.innerHTML = `<tr><td colspan="6" class="text-muted" style="text-align:center; padding: 24px;">No recorded measurements yet.</td></tr>`;
      return;
    }

    metricsHistoryTableBody.innerHTML = list.map(item => {
      const cat = Ezia.Calc.getBMICategory(item.bmi, item.age);
      const bmrDisplay = item.age < 18 ? 'Pediatric' : `${item.bmr} kcal`;
      return `
        <tr>
          <td><strong>${item.date}</strong></td>
          <td>${item.weightKg} kg</td>
          <td>${item.heightCm} cm</td>
          <td><strong>${item.bmi}</strong></td>
          <td>${bmrDisplay}</td>
          <td><span class="badge ${cat.badgeClass}">${cat.category}</span></td>
        </tr>
      `;
    }).join('');
  }

  // Initial Check on Load
  const initialLogs = Ezia.Storage.getBodyMetrics();
  if (initialLogs.length > 0) {
    renderResults(initialLogs[0]);
  } else {
    if (pediatricWarningBanner) pediatricWarningBanner.style.display = 'none';
    if (resultBmiNum) resultBmiNum.textContent = '—';
    if (resultBmrNum) resultBmrNum.textContent = '—';
    if (resultCategoryBadge) {
      resultCategoryBadge.textContent = 'Awaiting Input';
      resultCategoryBadge.className = 'badge badge-neutral';
    }
    if (resultCategoryText) {
      resultCategoryText.textContent = 'Enter your measurements to calculate clinical BMI.';
    }
    if (needleLabel) needleLabel.textContent = 'Enter measurements';
  }
  renderHistoryTable();
});
