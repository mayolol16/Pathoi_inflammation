# IMC 530 — Acute & Chronic Inflammation Active Learning Session

Interactive guided case session for **UB Jacobs School of Medicine (IMC 530)** with separate **Student** and **Instructor** interfaces, live classroom polling, synchronized slide reveal, curated + optional AI tutoring, real Wikimedia Commons pathology images alongside deterministic SVG models, and an in-app **Image Verification & Pin Calibrator** workspace.

## Features

- **Student Interface (`#/` or `#/join/<ROOMCODE>`)**
  - **Self-Paced Mode**: Complete the 5-part Normal vs. Abnormal warm-up, then work through Cases 1–3 (Vignette → Commit Hypothesis + Reasoning → Examine Pinned Slide Zones + Mediator Cascade → Diagnosis + Elaborate).
  - **Live Class Mode**: Join a 6-character classroom room code (or scan the QR code), submit live votes + reasoning, follow instructor pacing (or browse freely if enabled), and see class poll distributions and instructor-spotlighted slide zones in real time.
- **Instructor Interface (`#/instructor`)**
  - Protected by an instructor passcode (default `IMC530`, customizable via `VITE_INSTRUCTOR_PASSCODE` or Sync Settings).
  - **Room Management & QR Join**: One-click room creation, scannable QR code modal, and "Open Student Tab" quick tester.
  - **Live Poll Dashboard**: Open/Close/Reveal/Reset/Simulate votes, anonymized Student Reasoning Feed with filter pills and "Spotlight on Projector", plus dynamic **Instructor Talking Points** tailored to the distractors the room actually selected.
  - **Projector Mode**: Clean lecture-hall layout hiding instructor-only notes.
- **Image Verification & Pin Calibrator (`#/instructor` → Verify Images & Pins)**
  - Inspect all 10 Orientation visuals and 3 Case slides side-by-side (Real Specimen vs. Representative SVG Model).
  - Switch between Wikimedia candidates, paste a custom institutional image URL, upload a preview image, click to recalibrate numbered zone pins `(x%, y%)`, mark assets `Verified ✓`, and export `mediaConfig.json`.

---

## Deploying to GitHub Pages

1. Push this directory to a GitHub repository (`main` branch).
2. In your GitHub repo go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The included `.github/workflows/deploy.yml` automatically builds (`npm run build`) and deploys `./dist` to GitHub Pages on every push to `main`.

---

## Enabling Multi-Device Live Polling (Firebase Realtime Database — Free Spark Tier)

GitHub Pages serves static files, so to sync votes across students' phones and the lecture-hall projector:

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Create a project** (free Spark plan).
2. In the sidebar, click **Build → Realtime Database → Create Database** (start in test mode or paste `database.rules.json` into the **Rules** tab).
3. Click the gear icon → **Project Settings → Your apps → Add Web App (`</>`)** and copy the `firebaseConfig` object.
4. **Option A (Bake into GitHub Pages build):** Add these secrets under GitHub repo **Settings → Secrets and variables → Actions**:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_INSTRUCTOR_PASSCODE` (optional, defaults to `IMC530`)
5. **Option B (No rebuild required):** Open `#/instructor` → **Sync & Settings**, paste the `firebaseConfig` JSON snippet, and click **Save & Connect**.

> **Zero-config local mode:** Without Firebase configured, the app automatically uses **Local Multi-Tab Sync** (`BroadcastChannel` + `localStorage`), so you can test the Instructor view in one browser tab and Student view in another tab on the same machine immediately.

---

## Local Development

```bash
npm install
npm run dev
```
