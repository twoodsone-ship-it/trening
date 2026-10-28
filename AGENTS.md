# AGENTS & ENGINEERING ROLES

## Overview
Autonomous engineering collective designing, developing, testing, and deploying the **Smart Double Progression PWA Workout Tracker** (IronForge PWA / Умный Трекер Прогрессии) for GitHub Pages.

---

## Engineering Roles & Responsibilities

### 1. Lead System Architect & Algorithm Engineer
- **Role**: Mathematical modeling of Smart Double Progression.
- **Responsibilities**:
  - Defines the core state machine for progression: target rep range, RPE/RIR thresholds, momentum multiplier.
  - Implements plateau detection algorithms (e.g., 3 consecutive failures trigger micro-loading or deload recommendations).
  - Designs offline-first storage data schemas with forward/backward migration guarantees.
  - Computes 1RM estimates using the Epley and Brzycki equations:
    $$\text{1RM}_{\text{Epley}} = w \cdot \left(1 + \frac{r}{30}\right)$$
    $$\text{1RM}_{\text{Brzycki}} = w \cdot \frac{36}{37 - r}$$

### 2. Frontend & Gym Mobile UX Engineer
- **Role**: UI/UX specialist focused on high-pressure gym environments.
- **Responsibilities**:
  - Implements mobile-first, high-contrast OLED dark theme (`#09090b`, `#18181b`, zinc/emerald/violet accents).
  - Large touch targets (min 48px), thumb-friendly numeric steppers, and quick-add plate buttons.
  - Rest timer floating overlay with Web Audio API sound synthesis (three short beeps + long success tone) and native Haptic Vibration (`navigator.vibrate([100, 50, 100])`).
  - Active workout mode with live set-by-set completion checklists and previous workout comparison ghost-data.

### 3. PWA & Offline Storage Specialist
- **Role**: Progressive Web App and local data integrity.
- **Responsibilities**:
  - Configures `vite-plugin-pwa`, Web App Manifest, maskable app icons, theme colors, and Service Worker with `CacheFirst` / `StaleWhileRevalidate` strategies.
  - PWA install prompt banner with step-by-step instructions for iOS (Safari Add to Home Screen) and Android (Chrome Install).
  - Robust local storage manager with auto-backup, JSON import/export, and schema validation.

### 4. DevOps, QA & GitHub Pages Lead
- **Role**: CI/CD automation and release management.
- **Responsibilities**:
  - Configures Vite relative asset bundling (`base: './'`) for seamless zero-config GitHub Pages hosting under any repo subpath.
  - Prepares automated GitHub Actions workflow (`.github/workflows/deploy.yml`) for continuous deployment on push to `main`.
  - Configures `gh-pages` branch build and publish scripts.
  - Unit tests for progression calculation edge cases.
