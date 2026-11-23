/**
 * ==========================================================================
 * EZIA HISTORY PAGE BEHAVIOR (history.js)
 * Production-ready 7-day longitudinal trend analysis connected to Ezia.Auth.
 * User-isolated data, real arithmetic, verified empty states.
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

  const printBtn = document.getElementById('printReportBtn');
  const hydChartContainer = document.getElementById('historyHydrationChart');
  const sleepChartContainer = document.getElementById('historySleepChart');
  const tableBody = document.getElementById('historyTableBody');

  // Print button
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Generate 7 Days Data
  const days = [];
  const today = new Date();
  const hydLogs = Ezia.Storage.getHydrationLogs();
  const sleepLogs = Ezia.Storage.getSleepLogs();
  const waterGoal = profile.waterGoalMl || 2500;
  const sleepGoal = profile.sleepGoalHrs || 8.0;

  let totalWater7Days = 0;
  let totalSleep7Days = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString([], { weekday: 'short' });
    const fullDateLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

    // Water
    const dayWater = hydLogs
      .filter(item => item.date === dateStr)
      .reduce((sum, item) => sum + item.amountMl, 0);

    // Sleep
    const sleepItem = sleepLogs.find(item => item.date === dateStr);
    const daySleep = sleepItem ? sleepItem.durationHours : 0;
    const dayRating = sleepItem ? sleepItem.restfulness : 0;

    totalWater7Days += dayWater;
    totalSleep7Days += daySleep;

    // Daily Score
    const scoreData = Ezia.Calc.calculateDailyWellnessScore(dateStr);

    days.push({
      dateStr,
      dayLabel,
      fullDateLabel,
      water: dayWater,
      sleep: daySleep,
      rating: dayRating,
      hasData: scoreData.hasData,
      score: scoreData.hasData ? scoreData.totalScore : 0
    });
  }

  renderHydrationChart();
  renderSleepChart();
  renderTable();

  // 1. Hydration Chart
  function renderHydrationChart() {
    if (!hydChartContainer) return;

    if (totalWater7Days === 0) {
      hydChartContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 160px; text-align: center; padding: 20px; color: var(--color-ink-muted);">
          <span style="font-size: 24px; margin-bottom: 8px; opacity: 0.6;">💧</span>
          <strong style="color: var(--color-ink); font-size: 0.9rem; margin-bottom: 4px;">No Hydration Recorded</strong>
          <p style="margin: 0; font-size: 0.8rem; max-width: 300px;">
            Log your daily fluid intake in the Hydration Vessel to view volume bars against your ${waterGoal.toLocaleString()} ml target.
          </p>
        </div>
      `;
      return;
    }

    const w = 480;
    const h = 200;
    const padX = 35;
    const padY = 25;
    const cW = w - (padX * 2);
    const cH = h - (padY * 2);
    const maxVal = Math.max(3000, waterGoal);
    const colW = cW / 7;

    let svg = `<svg viewBox="0 0 ${w} ${h}" class="chart-svg" style="width:100%; height:auto;">`;

    // Target reference line at waterGoal ml
    const targetY = padY + cH - ((waterGoal / maxVal) * cH);
    svg += `
      <line x1="${padX}" y1="${targetY}" x2="${padX + cW}" y2="${targetY}" class="target-dash-line" />
      <text x="${padX + cW - 2}" y="${targetY - 4}" text-anchor="end" font-size="9" fill="#B7791F">Target ${waterGoal} ml</text>
    `;

    // Bottom Axis
    svg += `<line x1="${padX}" y1="${padY + cH}" x2="${padX + cW}" y2="${padY + cH}" class="chart-axis-line" />`;

    days.forEach((day, idx) => {
      const cx = padX + (idx * colW) + (colW / 2);
      const barH = Math.min(cH, (day.water / maxVal) * cH);
      const barY = padY + cH - barH;
      const barW = 20;

      svg += `
        <rect x="${cx - (barW / 2)}" y="${barY}" width="${barW}" height="${barH}" rx="3" fill="#087E8B">
          <title>${day.fullDateLabel}: ${day.water} ml</title>
        </rect>
        <text x="${cx}" y="${padY + cH + 16}" text-anchor="middle" class="chart-axis-text">${day.dayLabel}</text>
      `;
    });

    svg += `</svg>`;
    hydChartContainer.innerHTML = svg;
  }

  // 2. Sleep Chart
  function renderSleepChart() {
    if (!sleepChartContainer) return;

    if (totalSleep7Days === 0) {
      sleepChartContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 160px; text-align: center; padding: 20px; color: var(--color-ink-muted);">
          <span style="font-size: 24px; margin-bottom: 8px; opacity: 0.6;">🌙</span>
          <strong style="color: var(--color-ink); font-size: 0.9rem; margin-bottom: 4px;">No Sleep Logged</strong>
          <p style="margin: 0; font-size: 0.8rem; max-width: 300px;">
            Record your bedtime and wake times in the Sleep Sanctuary to track circadian trends against your ${sleepGoal}h target.
          </p>
        </div>
      `;
      return;
    }

    const w = 480;
    const h = 200;
    const padX = 35;
    const padY = 25;
    const cW = w - (padX * 2);
    const cH = h - (padY * 2);
    const maxVal = Math.max(10, sleepGoal + 2);
    const colW = cW / 7;

    let svg = `<svg viewBox="0 0 ${w} ${h}" class="chart-svg" style="width:100%; height:auto;">`;

    // Target reference line at sleepGoal hrs
    const targetY = padY + cH - ((sleepGoal / maxVal) * cH);
    svg += `
      <line x1="${padX}" y1="${targetY}" x2="${padX + cW}" y2="${targetY}" class="target-dash-line" />
      <text x="${padX + cW - 2}" y="${targetY - 4}" text-anchor="end" font-size="9" fill="#B7791F">Target ${sleepGoal}h</text>
    `;

    // Bottom Axis
    svg += `<line x1="${padX}" y1="${padY + cH}" x2="${padX + cW}" y2="${padY + cH}" class="chart-axis-line" />`;

    const pts = [];
    days.forEach((day, idx) => {
      const cx = padX + (idx * colW) + (colW / 2);
      const cy = padY + cH - Math.min(cH, (day.sleep / maxVal) * cH);
      pts.push({ x: cx, y: cy, sleep: day.sleep, label: day.fullDateLabel });
      svg += `<text x="${cx}" y="${padY + cH + 16}" text-anchor="middle" class="chart-axis-text">${day.dayLabel}</text>`;
    });

    // Connecting line
    if (pts.length > 1) {
      let pathD = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        pathD += ` L ${pts[i].x} ${pts[i].y}`;
      }
      svg += `<path d="${pathD}" fill="none" stroke="#5ABFA7" stroke-width="2.5" stroke-linecap="round" />`;
    }

    // Dots
    pts.forEach(p => {
      svg += `<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#5ABFA7" stroke="#FFFFFF" stroke-width="2"><title>${p.label}: ${p.sleep} hrs</title></circle>`;
    });

    svg += `</svg>`;
    sleepChartContainer.innerHTML = svg;
  }

  // 3. Summary Table
  function renderTable() {
    if (!tableBody) return;

    if (totalWater7Days === 0 && totalSleep7Days === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-muted" style="text-align: center; padding: 32px 16px;">
            No historical logs recorded for the past 7 days. Begin tracking your hydration or sleep to populate your longitudinal ledger.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = days.slice().reverse().map(d => {
      const waterPct = Math.round((d.water / waterGoal) * 100);
      const stars = d.rating > 0 ? '★'.repeat(d.rating) + '☆'.repeat(5 - d.rating) : '—';
      const sleepDisplay = d.sleep > 0 ? `${d.sleep} hrs` : '<span class="text-muted">—</span>';
      
      let badgeClass = 'badge-teal';
      let scoreText = `${d.score} / 100`;
      if (!d.hasData) {
        badgeClass = 'badge-neutral';
        scoreText = '—';
      } else if (d.score >= 80) {
        badgeClass = 'badge-mint';
      } else if (d.score < 50) {
        badgeClass = 'badge-amber';
      }

      return `
        <tr>
          <td><strong>${d.dateStr}</strong></td>
          <td>${d.dayLabel}</td>
          <td>${d.water.toLocaleString()} ml</td>
          <td>${waterPct}%</td>
          <td>${sleepDisplay}</td>
          <td><span style="color:#F59E0B;">${stars}</span></td>
          <td><span class="badge ${badgeClass}">${scoreText}</span></td>
        </tr>
      `;
    }).join('');
  }
});
