# EZIA — Modernized Medical-Wellness Platform

> **Brand Line:** *Ezia — Where medical precision meets everyday vitality.*  
> **Architecture:** Pure HTML5, Modern CSS3, and strict modular TypeScript (`target: ES2022`, browser-native ES Modules).  
> **UI Philosophy:** Editorial wellness SaaS inspired by Healthio, WellBase, and Althea — asymmetric bento compositions, calm alabaster canvas, deep teal prestige, restrained mint highlights, and dimensional vector visuals.  
> **Runtime Dependency:** Zero runtime external frameworks (Zero React, Zero Vue, Zero Tailwind, Zero Bootstrap). Pure browser DOM APIs.

---

## 1. Modern Architecture Overview

Ezia has been completely modernized from legacy vanilla scripts into a strictly typed, modular TypeScript architecture compiling directly to ES2022 browser modules:

```text
c:/Users/kalwa/Desktop/FSD/
├── src/                                  # Modern TypeScript Source
│   ├── types/                            # Typed Domain Models & Contracts
│   │   ├── user.ts                       # User, Profile, Credentials, UnitPreference
│   │   ├── health.ts                     # WaterLog, SleepLog, BMIRecord, WellnessScore
│   │   ├── settings.ts                   # UserSettings, NotificationPreferences
│   │   └── storage.ts                    # StorageSchema, StorageKey
│   ├── core/                             # Application Core & Infrastructure
│   │   ├── config.ts                     # Runtime configuration, defaults, safety thresholds
│   │   ├── errors.ts                     # Typed domain errors (ValidationError, StorageError)
│   │   └── events.ts                     # EventBus pub/sub for cross-module reactivity
│   ├── services/                         # Isolated Business Logic & Calculations
│   │   ├── crypto.service.ts             # Web Crypto SHA-256 password salting & hashing
│   │   ├── auth.service.ts               # Session management & guest sandbox isolation
│   │   ├── storage.service.ts            # Isolated namespaced LocalStorage persistence
│   │   └── calculator.service.ts         # Mifflin-St Jeor BMR, BMI, circadian duration math
│   ├── ui/                               # Reusable Native DOM UI Helpers
│   │   ├── sidebar.ts                    # Desktop nav glow & mobile responsive drawer
│   │   ├── toast.ts                      # Accessible ephemeral notification toasts
│   │   ├── date-badge.ts                 # Dynamic formatted current date headers
│   │   └── theme.ts                      # Theme & sensory tone helpers
│   ├── pages/                            # Dedicated Page Controllers (1 per route)
│   │   ├── landing.page.ts               # Editorial hero, 3D preview, bento pillar showcase
│   │   ├── auth.page.ts                  # Form validation, guest session, secure sign-in
│   │   ├── dashboard.page.ts             # Executive summary bento, live metric synchronization
│   │   ├── hydration.page.ts             # 3D fluid vessel, rapid intake log, timeline
│   │   ├── sleep.page.ts                 # Nocturnal sanctuary, midnight crossing, quality rating
│   │   ├── calculator.page.ts            # Clinical station, dual unit switch, pediatric guard
│   │   ├── insights.page.ts              # Algorithmic health intelligence & rationale badges
│   │   ├── history.page.ts               # Longitudinal dual-track SVG charts & print report
│   │   └── settings.page.ts              # Personal calibration, targets, JSON database export
│   ├── tests/
│   │   └── test_suite_modern.ts          # Comprehensive automated unit & integration suite
│   └── index.ts                          # Master facade & global window.Ezia compatibility
│
├── dist/                                 # Compiled Browser-Native ES Modules (.js)
│   ├── types/
│   ├── core/
│   ├── services/
│   ├── ui/
│   └── pages/
│
├── shared/                               # Shared Design System Stylesheets
│   ├── tokens.css                        # CSS Custom Properties (Teal, Ivory, Mint, Spacing)
│   ├── base.css                          # Typography hierarchies, resets, smooth scrolling
│   ├── components.css                    # Frosted glass cards, pill buttons, inputs, alerts
│   ├── layout.css                        # Responsive sidebar and container grids
│   └── shared.js                         # Backward-compatible global bridge
│
├── assets/                               # Visual Assets & Original Dimensional SVGs
│   ├── icons/ezia-logo.svg               # Refractive 3D brand symbol
│   ├── illustrations/                    # Custom 3D SVG vessels, dials, and lunar rest assets
│   └── images/                           # Editorial wellness photography
│
├── _backup_pre_modernization/            # Untouched full backup of original codebase
├── tsconfig.json                         # Strict TypeScript configuration
└── package.json                          # Build scripts & TypeScript tooling
```

---

## 2. Strict 10-Page Application Mapping

Every HTML page loads its dedicated compiled TypeScript module via standard browser-native `<script type="module">`:

| # | Route | HTML Structure | Compiled Module | Page Controller Source |
|---|---|---|---|---|
| **1** | **Landing** | [`index.html`](./index.html) | `dist/pages/landing.page.js` | [`src/pages/landing.page.ts`](./src/pages/landing.page.ts) |
| **2** | **Sign In** | [`login.html`](./login.html) | `dist/pages/auth.page.js` | [`src/pages/auth.page.ts`](./src/pages/auth.page.ts) |
| **3** | **Register** | [`register.html`](./register.html) | `dist/pages/auth.page.js` | [`src/pages/auth.page.ts`](./src/pages/auth.page.ts) |
| **4** | **Dashboard** | [`dashboard.html`](./dashboard.html) | `dist/pages/dashboard.page.js` | [`src/pages/dashboard.page.ts`](./src/pages/dashboard.page.ts) |
| **5** | **Calculator** | [`calculator.html`](./calculator.html) | `dist/pages/calculator.page.js` | [`src/pages/calculator.page.ts`](./src/pages/calculator.page.ts) |
| **6** | **Hydration** | [`hydration.html`](./hydration.html) | `dist/pages/hydration.page.js` | [`src/pages/hydration.page.ts`](./src/pages/hydration.page.ts) |
| **7** | **Sleep** | [`sleep.html`](./sleep.html) | `dist/pages/sleep.page.js` | [`src/pages/sleep.page.ts`](./src/pages/sleep.page.ts) |
| **8** | **Insights** | [`insights.html`](./insights.html) | `dist/pages/insights.page.js` | [`src/pages/insights.page.ts`](./src/pages/insights.page.ts) |
| **9** | **History** | [`history.html`](./history.html) | `dist/pages/history.page.js` | [`src/pages/history.page.ts`](./src/pages/history.page.ts) |
| **10** | **Settings** | [`settings.html`](./settings.html) | `dist/pages/settings.page.js` | [`src/pages/settings.page.ts`](./src/pages/settings.page.ts) |

---

## 3. How to Build, Test & Run

### Prerequisites
- Node.js (v18+)
- Python 3 (or any static HTTP server)

### 1. Compile TypeScript
```bash
# Clean build
npm run build

# Watch mode for active development
npm run watch
```
*Note: TypeScript emits standards-compliant ES2022 modules into `dist/` with zero bundling overhead.*

### 2. Run Test Suite
```bash
npm test
```
The automated test suite (`src/tests/test_suite_modern.ts`) runs 46 assertions validating:
- Cryptographic SHA-256 salting and password verification.
- User session isolation and guest sandbox containment (`ezia_u_${userId}_*`).
- Mifflin-St Jeor basal metabolic calculations for men and women.
- Cross-midnight circadian rest interval calculations.
- Pediatric boundary enforcement (safe nullification of adult caloric targets for minors).
- EventBus cross-module message dispatching.

### 3. Launch Local Server
Because modern browsers require HTTP/HTTPS to load ES modules via `<script type="module">`, run:
```bash
python -m http.server 8080
```
Then visit: `http://localhost:8080` in Chrome, Firefox, Edge, or Safari.

---

## 4. Clinical Formulations & Boundary Safeguards

1. **Body Mass Index (BMI):**
   $$\text{BMI} = \frac{\text{Weight (kg)}}{(\text{Height (m)})^2}$$
   - *Pediatric Guard:* Users under 18 years of age are automatically classified as pediatric exemptions. Clinical cutoffs are suppressed and replaced with guidance to consult official WHO/CDC growth percentiles.
2. **Basal Metabolic Rate (BMR) — Mifflin–St Jeor:**
   $$\text{BMR}_{\text{male}} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} + 5$$
   $$\text{BMR}_{\text{female}} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} - 161$$
   - Strictly applies to adults aged 18 and older. Minors are exempt from restrictive caloric recommendations.
3. **Circadian Midnight Crossing Calculation:**
   - Evaluates sleep durations spanning across midnight (e.g., Bedtime `23:15` to Wake time `07:15` automatically normalizes to `8.0` hours).
4. **Holistic Daily Wellness Synthesis (0–100):**
   - 40% Daily Hydration Target achievement.
   - 40% Daily Circadian Sleep Target achievement.
   - 20% Habit logging consistency across recent days.

---

## 5. Security & Privacy Sandbox

- **Client-Side Sandbox:** All biometric computations, hydration records, and sleep records execute entirely in client memory and isolated browser `localStorage`.
- **Zero Third-Party Telemetry:** Zero external tracker beacons, analytics scripts, or cloud data harvesting.
- **Cryptographic Password Security:** Client-side credentials use Web Crypto API `crypto.subtle.digest('SHA-256', ...)` with 16-byte random hexadecimal cryptographic salts.
- **Full Data Sovereignty:** Users can download their complete data history as a structured JSON database export or delete their profile and records with one click in [`settings.html`](./settings.html).
