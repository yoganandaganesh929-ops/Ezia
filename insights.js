/**
 * ==========================================================================
 * EZIA INSIGHTS BEHAVIOR (insights.js)
 * Clean, production-ready evidence-based observations connected to Ezia.Auth.
 * User-isolated data, real arithmetic, zero fabricated data.
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

  const container = document.getElementById('insightsCardsContainer');
  const avgHydrationStat = document.getElementById('avgHydrationStat');
  const avgSleepStat = document.getElementById('avgSleepStat');
  const consistencyStat = document.getElementById('consistencyStat');
  const filterPills = document.querySelectorAll('.filter-pill');

  let activeFilter = 'all';

  // Filter Buttons
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-filter');
      renderInsights();
    });
  });

  renderInsights();

  function renderInsights() {
    const hydLogs = Ezia.Storage.getHydrationLogs();
    const sleepLogs = Ezia.Storage.getSleepLogs();
    const bodyLogs = Ezia.Storage.getBodyMetrics();

    // 1. Calculate Averages
    const totalWater = hydLogs.reduce((s, i) => s + i.amountMl, 0);
    const uniqueWaterDays = new Set(hydLogs.map(i => i.date)).size;
    const avgWater = uniqueWaterDays > 0 ? Math.round(totalWater / uniqueWaterDays) : 0;

    const totalSleep = sleepLogs.reduce((s, i) => s + i.durationHours, 0);
    const uniqueSleepDays = new Set(sleepLogs.map(i => i.date)).size;
    const avgSleep = uniqueSleepDays > 0 ? (totalSleep / uniqueSleepDays).toFixed(1) : '0.0';

    const allLoggedDates = new Set([...hydLogs.map(i => i.date), ...sleepLogs.map(i => i.date)]);
    const loggedDaysCount = allLoggedDates.size;

    if (avgHydrationStat) {
      avgHydrationStat.textContent = uniqueWaterDays > 0 ? `${avgWater.toLocaleString()} ml / day` : '0 ml / day';
    }
    if (avgSleepStat) {
      avgSleepStat.textContent = uniqueSleepDays > 0 ? `${avgSleep} hrs / night` : '0.0 hrs / night';
    }
    if (consistencyStat) {
      consistencyStat.textContent = `${Math.min(7, loggedDaysCount)} of last 7 days`;
    }

    // 2. Generate Evidence-Based Observations based strictly on logged biometrics
    const insights = [];

    // Hydration insights
    if (hydLogs.length > 0) {
      insights.push({
        category: 'hydration',
        badge: 'Hydration Distribution',
        badgeClass: 'badge-teal',
        title: 'Consistent Fluid Pacing',
        body: 'Distributing your fluid intake steadily throughout daytime hours supports sustained cellular hydration without creating acute spikes in renal filtration load.',
        trigger: `Triggered by: Your average daily intake of ${avgWater.toLocaleString()} ml across ${uniqueWaterDays} recorded day${uniqueWaterDays > 1 ? 's' : ''}.`
      });

      if (avgWater >= 2000) {
        insights.push({
          category: 'hydration',
          badge: 'Daily Fluid Target',
          badgeClass: 'badge-mint',
          title: 'Optimal Hydration Volume',
          body: 'Consistently reaching 2,000+ ml daily aligns well with standard adult baseline fluid intake recommendations, supporting joint lubrication and cognitive focus.',
          trigger: `Triggered by: Daily volume average reaching ${avgWater.toLocaleString()} ml.`
        });
      } else {
        insights.push({
          category: 'hydration',
          badge: 'Hydration Awareness',
          badgeClass: 'badge-amber',
          title: 'Supporting Afternoon Fluid Intake',
          body: 'Mild dehydration of as little as 1-2% body mass can lead to afternoon fatigue. Keeping water visibly within reach encourages gentle, unforced intake.',
          trigger: `Triggered by: Current average of ${avgWater.toLocaleString()} ml per recorded day.`
        });
      }
    } else {
      insights.push({
        category: 'hydration',
        badge: 'Hydration Guidance',
        badgeClass: 'badge-teal',
        title: 'Calibrating Your Fluid Vessel',
        body: 'Cellular hydration impacts blood volume, cognitive alertness, and digestive health. Once you begin logging intake in the Hydration Vessel, Ezia calculates your daily pacing trends here.',
        trigger: 'Triggered by: Initial hydration onboarding & awaiting first fluid log.'
      });
    }

    // Sleep insights
    if (sleepLogs.length > 0) {
      const avgSleepNum = parseFloat(avgSleep);
      if (avgSleepNum >= 7 && avgSleepNum <= 9) {
        insights.push({
          category: 'sleep',
          badge: 'Circadian Equilibrium',
          badgeClass: 'badge-mint',
          title: 'Restorative Sleep Duration',
          body: 'Adult sleep durations between 7 and 9 hours are closely linked to biological cell repair, memory consolidation, and neuroendocrine balance.',
          trigger: `Triggered by: Your current average of ${avgSleep} hours of recorded rest.`
        });
      } else {
        insights.push({
          category: 'sleep',
          badge: 'Sleep Pattern',
          badgeClass: 'badge-amber',
          title: 'Circadian Regularity & Wind-Down',
          body: 'Maintaining consistent bedtimes and wake times anchors your peripheral circadian clocks. Dimming blue light exposure 30 minutes before sleep supports endogenous melatonin release.',
          trigger: `Triggered by: Average rest duration of ${avgSleep} hours across your logged sessions.`
        });
      }

      const avgRestfulness = (sleepLogs.reduce((s, i) => s + (i.restfulness || 3), 0) / sleepLogs.length).toFixed(1);
      insights.push({
        category: 'sleep',
        badge: 'Subjective Restfulness',
        badgeClass: 'badge-mint',
        title: 'Morning Recovery Perception',
        body: 'Subjective restfulness scores reflect non-REM slow-wave recovery and circadian alignment. Tracking how refreshed you feel upon waking helps correlate lifestyle habits with restorative rest.',
        trigger: `Triggered by: Average subjective restfulness rating of ${avgRestfulness} / 5 stars.`
      });
    } else {
      insights.push({
        category: 'sleep',
        badge: 'Circadian Guidance',
        badgeClass: 'badge-mint',
        title: 'Establishing Sleep Architecture',
        body: 'Sleep is the fundamental pillar of physical recovery and cellular repair. Logging your bedtimes and wake times in the Sleep Sanctuary enables detailed circadian intelligence reflections.',
        trigger: 'Triggered by: Sleep module awaiting your first recorded rest entry.'
      });
    }

    // Body Metrics / Metabolism insights
    if (bodyLogs.length > 0) {
      const latestBm = bodyLogs[0];
      const cat = Ezia.Calc.getBMICategory(latestBm.bmi, latestBm.age);
      const bmrVal = latestBm.age < 18 ? 'Pediatric reference' : `${latestBm.bmr.toLocaleString()} kcal/day`;
      insights.push({
        category: 'general',
        badge: 'Metabolic Baseline',
        badgeClass: 'badge-navy',
        title: 'Basal Metabolic Rate Perspective',
        body: 'Your estimated BMR represents energy expended solely for autonomic survival functions (breathing, cardiac output, organ maintenance). Total daily energy expenditure increases with physical movement and activity.',
        trigger: `Triggered by: Stored clinical metrics (${latestBm.weightKg} kg, ${latestBm.heightCm} cm, BMI ${latestBm.bmi}, BMR ${bmrVal}).`
      });
    } else {
      insights.push({
        category: 'general',
        badge: 'Anthropometric Guidance',
        badgeClass: 'badge-navy',
        title: 'Clinical Body Metrics & BMR',
        body: 'Entering your height, weight, and biological age calculates your Body Mass Index and Mifflin-St Jeor Basal Metabolic Rate with transparent clinical safety boundaries.',
        trigger: 'Triggered by: Body Metrics module awaiting initial anthropometric measurement.'
      });
    }

    // General consistency insight
    insights.push({
      category: 'general',
      badge: 'Habit Regularity',
      badgeClass: 'badge-teal',
      title: 'Mindful Data Tracking',
      body: 'Habit tracking is most beneficial when treated as reflective curiosity rather than rigid perfectionism. Consistent data logging over weeks reveals natural cyclical rhythms.',
      trigger: loggedDaysCount > 0 
        ? `Triggered by: Active logging across ${loggedDaysCount} recorded day${loggedDaysCount > 1 ? 's' : ''}.`
        : 'Triggered by: Getting started with your private Ezia wellness records.'
    });

    // Filter cards
    const filtered = activeFilter === 'all' 
      ? insights 
      : insights.filter(item => item.category === activeFilter);

    if (container) {
      if (filtered.length === 0) {
        container.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 40px;">No insights found for this filter category.</p>`;
        return;
      }

      container.innerHTML = filtered.map(item => `
        <article class="card insight-card">
          <div class="insight-card-top">
            <div class="insight-card-meta">
              <span class="badge ${item.badgeClass}">${item.badge}</span>
              <span class="eyebrow" style="font-size: 10px; margin-bottom: 0;">Clinical Intelligence</span>
            </div>
            <h3 class="insight-title">${item.title}</h3>
            <p class="insight-body">${item.body}</p>
          </div>
          <div class="triggered-by-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; margin-top: 1px;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>${item.trigger}</span>
          </div>
        </article>
      `).join('');
    }
  }
});
