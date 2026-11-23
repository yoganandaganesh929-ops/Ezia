/**
 * ==========================================================================
 * EZIA DASHBOARD BEHAVIOR (dashboard.js)
 * Clean, production-ready dashboard connected to Ezia.Auth & isolated storage.
 * Zero fabricated data; robust empty states and real metrics.
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

  // 1. Personalized Greeting & Avatar
  const greetingHeading = document.getElementById('greetingHeading');
  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const sidebarUserStatus = document.getElementById('sidebarUserStatus');
  const logoutLink = document.getElementById('sidebarLogout');
  const activeName = (user && user.name) || profile.name || (isGuest ? 'Guest Explorer' : 'Member');

  if (greetingHeading) {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else if (hour >= 17) timeGreeting = 'Good evening';
    greetingHeading.textContent = `${timeGreeting}, ${activeName}`;
    greetingHeading.style.visibility = 'visible';
  }

  if (sidebarUserName) {
    sidebarUserName.textContent = activeName;
  }

  if (sidebarUserStatus) {
    sidebarUserStatus.textContent = isGuest ? 'Guest Session' : 'Private Session';
  }

  if (logoutLink && isGuest) {
    logoutLink.textContent = 'Sign In / Register →';
  }

  if (sidebarAvatar) {
    const initials = isGuest ? 'GE' : (activeName
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'EZ');
    sidebarAvatar.textContent = initials;
    sidebarAvatar.style.visibility = 'visible';
  }

  // Reveal sidebar user info block after values are set
  const sidebarUserInfo = document.getElementById('sidebarUserInfo');
  if (sidebarUserInfo) sidebarUserInfo.style.visibility = 'visible';

  // 2. Date Badge
  const headerDateBadge = document.getElementById('headerDateBadge');
  if (headerDateBadge) {
    headerDateBadge.textContent = new Date().toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    headerDateBadge.style.visibility = 'visible';
  }

  // 3. Quick-Add Water Button
  const quickLogWaterBtn = document.getElementById('quickLogWaterBtn');
  if (quickLogWaterBtn) {
    quickLogWaterBtn.addEventListener('click', () => {
      Ezia.Storage.addHydrationEntry(250);
      Ezia.showToast('Logged +250 ml water', 'success');
      renderDashboard();
    });
  }

  // 4. Logout / Switch Mode Handler
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isGuest) {
        Ezia.Auth.logout();
      }
      window.location.href = './login.html';
    });
  }

  // Render dashboard
  renderDashboard();

  function renderDashboard() {
    const todayStr = new Date().toISOString().split('T')[0];
    const wellnessData = Ezia.Calc.calculateDailyWellnessScore(todayStr);

    // --- A. Wellness Indicator & Circular Progress ---
    const scoreValEl = document.getElementById('wellnessScoreVal');
    const scoreArc = document.getElementById('scoreProgressArc');
    const scoreHydrationPart = document.getElementById('scoreHydrationPart');
    const scoreSleepPart = document.getElementById('scoreSleepPart');
    const scoreConsistencyPart = document.getElementById('scoreConsistencyPart');
    const wellnessSummary = document.getElementById('wellnessSummary');

    if (scoreValEl) scoreValEl.textContent = wellnessData.hasData ? wellnessData.totalScore : '0';
    if (scoreHydrationPart) scoreHydrationPart.textContent = `${wellnessData.components.hydration} / 40`;
    if (scoreSleepPart) scoreSleepPart.textContent = `${wellnessData.components.sleep} / 40`;
    if (scoreConsistencyPart) scoreConsistencyPart.textContent = `${wellnessData.components.consistency} / 20`;

    if (scoreArc) {
      // Circumference for r=58 is 2 * PI * 58 = ~364.42
      const circumference = 364.42;
      const score = wellnessData.hasData ? wellnessData.totalScore : 0;
      const offset = circumference - (circumference * (score / 100));
      scoreArc.style.strokeDashoffset = Math.max(0, offset);
    }

    if (wellnessSummary) {
      if (!wellnessData.hasData) {
        wellnessSummary.textContent = 'Welcome to Ezia. You have not logged hydration or sleep for today yet. Record an entry below to activate your equilibrium score.';
      } else if (wellnessData.totalScore >= 80) {
        wellnessSummary.textContent = 'Excellent daily habit rhythm. Your hydration and restorative sleep targets are well balanced today.';
      } else if (wellnessData.totalScore >= 50) {
        wellnessSummary.textContent = 'Steady progress today. Consider logging your afternoon water or prioritizing an early wind-down tonight.';
      } else {
        wellnessSummary.textContent = 'A gentle reminder to hydrate regularly and log your rest patterns as your day unfolds.';
      }
    }

    // --- B. Hydration Card ---
    const metricWaterVal = document.getElementById('metricWaterVal');
    const metricWaterBar = document.getElementById('metricWaterBar');
    const metricWaterContext = document.getElementById('metricWaterContext');

    const totalWater = wellnessData.hydrationLoggedMl;
    const waterGoal = wellnessData.hydrationGoalMl || 2500;
    const waterPercent = Math.min(100, Math.round((totalWater / waterGoal) * 100));

    if (metricWaterVal) metricWaterVal.textContent = totalWater.toLocaleString();
    if (metricWaterBar) metricWaterBar.style.width = `${waterPercent}%`;
    if (metricWaterContext) {
      metricWaterContext.textContent = `${waterPercent}% of ${waterGoal.toLocaleString()} ml personal target`;
    }

    // --- C. Sleep Card ---
    const metricSleepVal = document.getElementById('metricSleepVal');
    const metricSleepStars = document.getElementById('metricSleepStars');
    const metricSleepContext = document.getElementById('metricSleepContext');

    const sleepLogs = Ezia.Storage.getSleepLogs();
    const todaySleep = sleepLogs.find(item => item.date === todayStr);

    if (todaySleep) {
      if (metricSleepVal) metricSleepVal.textContent = todaySleep.durationHours;
      if (metricSleepStars) {
        const fullStars = '★'.repeat(todaySleep.restfulness || 0);
        const emptyStars = '☆'.repeat(Math.max(0, 5 - (todaySleep.restfulness || 0)));
        metricSleepStars.textContent = fullStars + emptyStars;
      }
      if (metricSleepContext) {
        metricSleepContext.textContent = `Logged ${todaySleep.durationHours} hrs (${todaySleep.bedtime || ''} - ${todaySleep.wakeTime || ''})`;
      }
    } else if (sleepLogs.length > 0) {
      const latestSleep = sleepLogs[0];
      if (metricSleepVal) metricSleepVal.textContent = latestSleep.durationHours;
      if (metricSleepStars) {
        const fullStars = '★'.repeat(latestSleep.restfulness || 0);
        const emptyStars = '☆'.repeat(Math.max(0, 5 - (latestSleep.restfulness || 0)));
        metricSleepStars.textContent = fullStars + emptyStars;
      }
      if (metricSleepContext) {
        metricSleepContext.textContent = `Latest log: ${latestSleep.durationHours} hrs (${latestSleep.date})`;
      }
    } else {
      if (metricSleepVal) metricSleepVal.textContent = '—';
      if (metricSleepStars) metricSleepStars.textContent = '☆☆☆☆☆';
      if (metricSleepContext) metricSleepContext.textContent = 'No sleep logged for today yet';
    }

    // --- D. Body Metrics Card ---
    const metricBmiVal = document.getElementById('metricBmiVal');
    const metricBmiBadge = document.getElementById('metricBmiBadge');
    const metricBmiContext = document.getElementById('metricBmiContext');

    const metricsLogs = Ezia.Storage.getBodyMetrics();
    if (metricsLogs.length > 0) {
      const latestBm = metricsLogs[0];
      if (metricBmiVal) metricBmiVal.textContent = latestBm.bmi;
      const cat = Ezia.Calc.getBMICategory(latestBm.bmi, latestBm.age);
      if (metricBmiBadge) {
        metricBmiBadge.textContent = cat.category;
        metricBmiBadge.className = `badge ${cat.badgeClass}`;
      }
      if (metricBmiContext) {
        metricBmiContext.textContent = `Weight: ${latestBm.weightKg} kg · Height: ${latestBm.heightCm} cm`;
      }
    } else {
      if (metricBmiVal) metricBmiVal.textContent = '—';
      if (metricBmiBadge) {
        metricBmiBadge.textContent = 'Unrecorded';
        metricBmiBadge.className = 'badge badge-neutral';
      }
      if (metricBmiContext) {
        metricBmiContext.textContent = 'No measurements logged yet';
      }
    }

    // --- E. Render 7-Day Trend Chart ---
    renderSevenDayTrendChart();

    // --- F. Render Supportive Wellness Notes ---
    renderWellnessNotes(wellnessData);
  }

  // --- Dynamic SVG 7-Day Trend Chart ---
  function renderSevenDayTrendChart() {
    const container = document.getElementById('sevenDayChartContainer');
    if (!container) return;

    const hydLogs = Ezia.Storage.getHydrationLogs();
    const sleepLogs = Ezia.Storage.getSleepLogs();

    // Generate last 7 days dates
    const days = [];
    const today = new Date();
    let totalWaterLogged = 0;
    let totalSleepLogged = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString([], { weekday: 'short' });

      // Calculate total water for that day
      const dayWater = hydLogs
        .filter(item => item.date === dateStr)
        .reduce((sum, item) => sum + item.amountMl, 0);

      // Latest sleep for that day
      const daySleepItem = sleepLogs.find(item => item.date === dateStr);
      const daySleepHours = daySleepItem ? daySleepItem.durationHours : 0;

      totalWaterLogged += dayWater;
      totalSleepLogged += daySleepHours;

      days.push({
        date: dateStr,
        label: dayLabel,
        waterMl: dayWater,
        sleepHours: daySleepHours
      });
    }

    const accSummary = document.getElementById('chartAccessibleSummary');

    // If completely empty (no logs in last 7 days), show clean empty state
    if (totalWaterLogged === 0 && totalSleepLogged === 0) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 180px; text-align: center; padding: 24px; color: var(--color-ink-muted);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <strong style="color: var(--color-ink); font-size: 0.95rem; margin-bottom: 4px;">No 7-Day Activity Recorded</strong>
          <p style="margin: 0; font-size: 0.85rem; max-width: 380px;">
            Log your daily hydration or restorative sleep to begin visualizing dual-track trends across the week.
          </p>
        </div>
      `;
      if (accSummary) {
        accSummary.textContent = 'No hydration or sleep entries recorded in the last seven days.';
      }
      return;
    }

    // SVG Viewbox dimensions: 700 x 200
    const svgWidth = 700;
    const svgHeight = 200;
    const padX = 40;
    const padY = 25;
    const chartW = svgWidth - (padX * 2);
    const chartH = svgHeight - (padY * 2);

    const maxWater = 3000;
    const maxSleep = 10;
    const colWidth = chartW / 7;

    let svgHtml = `<svg class="chart-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img">`;

    // Horizontal guideline
    const midY = padY + chartH / 2;
    svgHtml += `<line x1="${padX}" y1="${midY}" x2="${padX + chartW}" y2="${midY}" class="chart-grid-line" />`;
    svgHtml += `<line x1="${padX}" y1="${padY + chartH}" x2="${padX + chartW}" y2="${padY + chartH}" class="chart-axis-line" />`;

    // Left Y Axis labels
    svgHtml += `<text x="${padX - 8}" y="${padY + 10}" text-anchor="end" class="chart-axis-text">3L / 10h</text>`;
    svgHtml += `<text x="${padX - 8}" y="${midY + 4}" text-anchor="end" class="chart-axis-text">1.5L / 5h</text>`;
    svgHtml += `<text x="${padX - 8}" y="${padY + chartH}" text-anchor="end" class="chart-axis-text">0</text>`;

    // Draw Bars (Water) & Points (Sleep)
    let sleepPoints = [];

    days.forEach((day, idx) => {
      const centerX = padX + (idx * colWidth) + (colWidth / 2);
      
      // Bar height for water
      const waterHeight = Math.min(chartH, (day.waterMl / maxWater) * chartH);
      const barY = padY + chartH - waterHeight;
      const barW = 24;

      svgHtml += `
        <rect 
          x="${centerX - (barW / 2)}" 
          y="${barY}" 
          width="${barW}" 
          height="${waterHeight}" 
          class="chart-bar-water"
        >
          <title>${day.label}: ${day.waterMl} ml water</title>
        </rect>
      `;

      // Sleep Y point
      const sleepY = padY + chartH - Math.min(chartH, (day.sleepHours / maxSleep) * chartH);
      sleepPoints.push({ x: centerX, y: sleepY, hours: day.sleepHours, label: day.label });

      // Day label
      svgHtml += `<text x="${centerX}" y="${padY + chartH + 18}" text-anchor="middle" class="chart-axis-text">${day.label}</text>`;
    });

    // Draw Sleep connecting line
    if (sleepPoints.length > 1) {
      let pathD = `M ${sleepPoints[0].x} ${sleepPoints[0].y}`;
      for (let i = 1; i < sleepPoints.length; i++) {
        pathD += ` L ${sleepPoints[i].x} ${sleepPoints[i].y}`;
      }
      svgHtml += `<path d="${pathD}" class="chart-line-sleep" />`;
    }

    // Draw Sleep Dots
    sleepPoints.forEach(pt => {
      svgHtml += `
        <circle cx="${pt.x}" cy="${pt.y}" r="4.5" class="chart-dot-sleep">
          <title>${pt.label}: ${pt.hours} hrs sleep</title>
        </circle>
      `;
    });

    svgHtml += `</svg>`;
    container.innerHTML = svgHtml;

    if (accSummary) {
      const avgWater = Math.round(totalWaterLogged / 7);
      const avgSleep = (totalSleepLogged / 7).toFixed(1);
      accSummary.textContent = `Over the past seven days, your average recorded hydration was ${avgWater} ml and average sleep was ${avgSleep} hours.`;
    }
  }

  // --- Dynamic Supportive Notes ---
  function renderWellnessNotes(wellnessData) {
    const listEl = document.getElementById('dashboardNotesList');
    if (!listEl) return;

    const notes = [];

    if (!wellnessData.hasData) {
      notes.push({
        title: 'Begin with Hydration',
        tag: 'Getting Started',
        text: 'Logging even a single glass of water (250 ml) initiates your hydration pacing and provides immediate visual feedback on your daily target.'
      });
      notes.push({
        title: 'Calibrate Sleep Rhythm',
        tag: 'Circadian Health',
        text: 'Record your sleep duration and bedtime schedule in the Sleep Sanctuary module to observe patterns between restfulness and daytime energy.'
      });
    } else {
      // Hydration note
      if (wellnessData.hydrationLoggedMl < 1000) {
        notes.push({
          title: 'Midday Hydration Prompt',
          tag: 'Hydration',
          text: 'You have recorded less than 1,000 ml so far today. Keeping a filled glass within reach can gently support consistent afternoon intake.'
        });
      } else {
        notes.push({
          title: 'Consistent Fluid Intake',
          tag: 'Hydration',
          text: `You have logged ${wellnessData.hydrationLoggedMl.toLocaleString()} ml today, moving steadily toward your preferred target.`
        });
      }

      // Sleep note
      if (wellnessData.sleepLoggedHours >= 7 && wellnessData.sleepLoggedHours <= 9) {
        notes.push({
          title: 'Restorative Sleep Range',
          tag: 'Sleep',
          text: `Your recorded ${wellnessData.sleepLoggedHours} hours of sleep aligns with standard adult biological rest recommendations.`
        });
      } else if (wellnessData.sleepLoggedHours > 0) {
        notes.push({
          title: 'Sleep Duration Observation',
          tag: 'Sleep',
          text: `You recorded ${wellnessData.sleepLoggedHours} hours of sleep. Try winding down screen use 30 minutes earlier tonight to support deeper rest.`
        });
      } else {
        notes.push({
          title: 'Sleep Record Open',
          tag: 'Sleep',
          text: 'Record your bedtime and wake time in the Sleep module to incorporate your restfulness into your daily wellness rhythm.'
        });
      }
    }

    listEl.innerHTML = notes.map(n => `
      <div class="note-item">
        <div class="note-item-header">
          <strong>${n.title}</strong>
          <span class="badge badge-teal">${n.tag}</span>
        </div>
        <p>${n.text}</p>
      </div>
    `).join('');
  }
});
