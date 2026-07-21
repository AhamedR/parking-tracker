# Parking Tracker PWA — PRD & Technical Spec (v2)

## 1. Product Goal

Help a user save and recover their parking spot in seconds, especially in underground garages where GPS is unreliable. The app is privacy-first, offline-capable, and stores all data locally on the device.

## 2. MVP Scope (Phase 1)

### Core features
- **Capture Spot** — floor number, bay number, free-text note, plus a short **vehicle label** (e.g. "My car", "Work van") so a user can tell sessions apart when more than one is active.
- **Photo Capture** — in-app camera (not a handoff to the phone's native camera app), so the user never leaves the flow. Photo is compressed client-side before it's stored.
- **Timer** — user sets a duration; a countdown displays on the dashboard. **No push notifications** — this is a visual-only timer, so it only means something while the user actually opens the app.
- **History** — list of past sessions (completed or expired), stored locally.
- **Offline First** — full functionality without an active connection.
- **PWA Installation** — installable to home screen.
- **Multiple Simultaneous Sessions** — a user can have more than one active session at once (e.g. two vehicles). No hard cap in MVP, but the UI needs to handle 2+ gracefully (see §4).
- **Manual "Found My Car" action** — explicitly ends a session rather than just letting it expire.
- **Theme** — dark mode only.

### Explicit MVP disclaimer
On first use (and reachable later from a settings/about area), show:

> "Your parking data and photos are stored only on this device. If you clear your browser data, uninstall the app, or switch devices, this information will be lost. There is currently no cloud backup."

This is a one-time modal + a small persistent note near History/Settings — not a blocking gate the user has to re-confirm every session.

### Explicitly deferred to Phase 2+
- Cloud sync / cross-device backup
- **Manual export/backup** (e.g. download session history as JSON/zip) — you flagged this as a near-term enhancement right after MVP, worth prioritizing early in Phase 2 given the disclaimer above
- Formal Vehicle Profiles (persistent vehicle records, vs. the free-text label used in MVP)
- Navigation / Maps deep-linking
- Home screen widgets
- Blog / SEO content
- Push notifications (if revisited later, would need either a relay server for Web Push, or acceptance of iOS limitations)

## 3. User Scenarios

- **The Underground Garage:** No GPS signal. User opens the app, takes a photo in-app, notes floor/bay, hits save — done in seconds.
- **The Long Meeting:** User sets a 2-hour timer. There's no alert — the countdown is visible next time they open the app or glance at the dashboard.
- **The Two-Car Household:** A user (or their partner) starts a second session while the first is still active. Both show up as separate cards on the dashboard.

## 4. User Flow & States

The dashboard adapts based on how many sessions are active:

1. **No active sessions (Capture Mode):**
   - Primary Action: large "Save Spot" button (bottom center).
   - Secondary Actions: "Take Photo," "Add Quick Note," vehicle label field.

2. **One active session (Retrieval Mode):**
   - Primary Action: "Found My Car" (ends session).
   - Visual: countdown timer, photo thumbnail, floor/bay/notes, status color.

3. **Multiple active sessions (Retrieval List Mode):**
   - Dashboard shows a stacked list of session cards (vehicle label, mini countdown, status color, thumbnail).
   - Tapping a card opens the full single-session Retrieval view (state 2) for that session.
   - A persistent "+ Save New Spot" affordance stays reachable so a second/third session can always be started.

### Status colors (unchanged from original PRD)
- 🟢 Green — Parked, timer running
- 🟠 Amber — Warning (e.g. last 15 min of duration — purely visual, no notification)
- 🔴 Red — Expired

## 5. Design System & Visual Language
(Unchanged from original)
- Minimalist, modern, high-contrast for accessibility
- Clean sans-serif (Inter or System UI)
- Generous padding, 16–24px border radii
- Primary action: vibrant (Electric Blue or Safety Orange)

## 6. Technical Architecture

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Storage:** IndexedDB via `idb`
- **PWA:** `app/manifest.ts` (Next's native Web App Manifest support) for installability, + **Serwist** (`@serwist/next`) for the service worker/offline shell. `next-pwa` is unmaintained (its own fork now recommends migrating to Serwist), so it's skipped in favor of the actively-maintained, Workbox-based option. Since there's no API to cache — all real data lives in IndexedDB — the service worker's job stays narrow: precache the app shell and static assets only, no complex runtime caching strategy needed, and no push-related service worker logic (notifications are out of scope).

### 6.1 Data model

```
Session {
  id: string (uuid)
  vehicleLabel: string        // free text, e.g. "My car" — default "Car 1"
  floor: string
  bay: string
  note: string
  photoBlob: Blob             // compressed JPEG/WebP
  startTime: number           // epoch ms
  durationMinutes: number
  expiryTime: number          // epoch ms, derived at save time
  status: 'active' | 'completed' | 'expired'
  completedAt: number | null
}
```

IndexedDB object store: `sessions`, indexed on `status` and `expiryTime` (so the dashboard can cheaply query "all active" and sort by soonest-expiring).

### 6.2 Timer mechanics (no push notifications)

Since this is visual-only:
- Don't rely purely on a running `setInterval` for correctness — **recompute each session's status from `expiryTime` vs. `Date.now()` every time the app is opened/focused**, not just while it happens to be running. A session should correctly show as "expired" even if the user didn't have the tab open when it technically expired.
- `setInterval` (e.g. every second/minute) only drives the *live-updating display* while the app is in the foreground; it is not the source of truth for status.
- A background `visibilitychange` / focus listener should trigger a re-check so the dashboard is always accurate the instant it's viewed.

### 6.3 In-app camera capture

Since the decision is in-app camera rather than a native handoff:
- Use `getUserMedia` to stream to a `<video>` element, with a shutter action that draws the current frame to an off-screen `<canvas>`.
- **Compression before storage:** resize the canvas output to a max dimension (e.g. 1280px on the longest side) and export via `canvas.toBlob(...)` at a moderate JPEG quality (~0.6–0.7). This keeps files small (typically well under 300KB) without being unusably blurry for identifying a pillar/sign.
- **Explicitly manage the media stream lifecycle** — call `track.stop()` on every track as soon as the photo is captured or the camera view is closed/cancelled, so the camera doesn't stay "on" in the background (battery drain + the OS camera indicator staying lit is a bad look).
- **Flash/low-light caveat to design around, not ignore:** torch/flash control via web APIs is inconsistent — decent on some Android/Chrome combos, essentially unavailable on iOS Safari. Since underground garages are the primary use case, consider a simple **on-screen brightness boost** (e.g. a bright white overlay behind the camera view acting as a crude "flash") as a cheap mitigation, since you can't rely on the hardware flash.
- **Fallback path:** if `getUserMedia` permission is denied or unsupported, fall back to the native `<input type="file" accept="image/*" capture="environment">` picker rather than dead-ending the flow. This keeps "in-app camera" as the primary path while still letting the user save a spot if camera access fails.

### 6.3a Hydration safety (IndexedDB is client-only)

The server has no visibility into IndexedDB, so nothing session-dependent can render differently on the server vs. the first client paint, or React will throw a hydration mismatch. Pattern: any session-reading component is a client component (`'use client'`); its state starts as `'loading'` with an empty session list on *both* server and first client render, and the real IndexedDB read happens inside `useEffect` (which never runs during SSR) — so server and client agree until the effect resolves and the UI swaps to real data. `useSessions` should expose a `status: 'loading' | 'ready' | 'error'` alongside the session list so the dashboard can render a neutral skeleton until data is actually available. (`useSyncExternalStore` is a more rigorous alternative to the `useEffect`/`useState` pair here, since it has an explicit `getServerSnapshot` slot — worth it if the team wants stronger guarantees, more setup either way.)

### 6.3b Camera fallback state machine

Model camera state as a single enum (`'idle' | 'requesting' | 'streaming' | 'denied'`), not independent booleans — two flags can theoretically both be true/false for a render tick, which is exactly what causes the `<video>` element and the `<input type="file">` fallback to both attempt to mount, a known trigger for iOS Safari web view freezes. On a `getUserMedia` catch, flip state to `'denied'` synchronously so the `<video>` branch fully unmounts (not just hides) before the file input renders. Always stop all `MediaStreamTrack`s in a cleanup effect, not just on the happy path.
- No artificial cap in MVP, but the dashboard list view (§4.3) needs a sensible design ceiling (e.g. comfortably handles up to ~5 without feeling cluttered; beyond that, scroll).
- `vehicleLabel` is just a string field for now — this is intentionally lightweight compared to the "real" Vehicle Profiles feature planned for Phase 2 (which would add persistent vehicle records, maybe an icon/color per vehicle, reused across sessions).

### 6.5 Storage housekeeping
- No firm retention limit is set in this version, but flag it: unbounded photo storage will eventually hit browser storage quotas (especially on iOS, which is stricter). Even without a full pruning policy, consider surfacing a simple "Clear old history" action in Settings so the user isn't stuck if they hit a quota error.
- Compression (§6.3) does most of the heavy lifting here for now.

### 6.6 Animation (card → detail transition)

The list-card-to-full-detail transition (§4.3) is a real UX nice-to-have, not a functional requirement. **Skip Framer Motion for MVP** and use plain Tailwind transitions (`transition-all`, scale/opacity, or a simple slide-up) instead — a shared-element morph is a polish item, not something the "save spot in seconds" value prop depends on, and it's one more dependency and bundle-size/learning-curve cost while you're trying to ship fast. Revisit adding Framer Motion (specifically `layoutId` for the shared-element morph) as a post-MVP polish pass once the core flows are working and you have time to spend on interface fluidity.

### 6.7 Code Structure (Atomic Design — extended)
- `/components/atoms`: Buttons, Inputs, Badges, StatusDot
- `/components/molecules`: Timer display, SessionCard, DisclaimerBanner, VehicleLabelInput
- `/components/organisms`: ParkingDashboard (handles single vs. list mode), PhotoCapture (in-app camera + fallback), SessionDetail
- `/hooks`: `useSessions` (CRUD + status recompute), `useCamera` (stream lifecycle, capture, compression)
- `/services`: `sessionsRepository.ts` (IndexedDB access via `idb`)
- **Tooling:** Storybook for component development — worth double-checking this is still the right amount of process for a solo/small-team MVP versus adding it once components stabilize; not a blocker either way.

## 7. Open Questions / Assumptions to confirm
- No hard cap assumed on concurrent sessions — confirm a soft UI limit is fine, or if you want a real cap (e.g. max 3) for MVP simplicity.
- No history retention/auto-delete policy yet — confirmed deferred, but a manual "clear old history" action is recommended even before automated pruning exists.
- Camera brightness-boost mitigation (§6.3) is a suggestion, not a confirmed requirement — flag if you want it in scope for MVP or considered a nice-to-have.
