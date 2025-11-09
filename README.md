# JeevanSetu

> AI-assisted, bilingual care-management platform that bridges patients, caregivers, and healthcare providers with a unified record system, on-device health passport, and Gemini-powered insights.

## Table of Contents
1. [Overview](#overview)
2. [Feature Highlights](#feature-highlights)
3. [Architecture & Stack](#architecture--stack)
4. [Repository Layout](#repository-layout)
5. [Prerequisites](#prerequisites)
6. [Environment Variables](#environment-variables)
7. [Local Development](#local-development)
8. [Available Scripts](#available-scripts)
9. [API Surface](#api-surface)
10. [Frontend Modules](#frontend-modules)
11. [Deployment Notes](#deployment-notes)
12. [Troubleshooting](#troubleshooting)
13. [Resources & Next Steps](#resources--next-steps)

---

## Overview
JeevanSetu is a full-stack MERN application designed during HackCBS 8.0 to function as a digital bridge (“Setu”) between patients and care teams. It centralizes health records, digitizes prescriptions, auto-generates treatment plans, surfaces critical signals from lab reports, and provides an emergency-ready health passport that can be shared online or offline. The platform supports both **patient** and **provider** roles, offers bilingual (English/Hindi) UX for AI outputs, and leans on Cloudinary + Google Gemini APIs for secure file handling and medical reasoning.

Quick links:
- [Detailed setup playbook](SETUP_GUIDE.md)
- [Deployment cookbook](DEPLOYMENT.md)

---

## Feature Highlights
- **Secure auth + role-aware flows** – JWT-backed login/register (`backend/routes/auth.js`) with hashed passwords and role gating for blood bank providers.
- **Unified health records & document vault** – CRUD APIs for `HealthRecord` and `Document` models with Cloudinary storage (`backend/routes/documents.js`). The UI embeds Google Docs previewers and smart tagging (e.g., `prescription`, `testReport`).
- **AI care plan copilot** – Upload prescriptions (PDF/image/text) and receive Gemini-generated condition summaries, dosing schedules, diet plans, do/don’t lists, and daily checklists. Plans include QR codes + share links (`backend/routes/carePlans.js`, `backend/services/geminiService.js`).
- **AI test report analyzer** – Test uploads flow through Gemini 2.0 Flash to produce clinical summaries, red-flag detection, balancing recommendations, and follow-up advice with severity levels (`backend/routes/testReports.js`).
- **Digital health passport** – Stores allergies, chronic conditions, meds, and emergency contacts; produces offline payloads and expiring share tokens + QR codes for first responders (`backend/routes/healthPassport.js`, `frontend/src/pages/HealthPassport*.jsx`).
- **Blood bank network** – Providers can register inventory, while patients can discover nearby matches via Leaflet maps, navigator geolocation, and Haversine filtering (`frontend/src/pages/BloodBanks.jsx`).
- **Delightful UX layer** – Tailwind-powered dashboard, responsive navigation, bilingual copy via `utils/translations`, voice settings, skeleton loaders, and micro-animations to keep the experience polished.

---

## Architecture & Stack

| Layer | Tech | Notes |
| --- | --- | --- |
| Frontend | React 18 + Vite + TailwindCSS + React Router + Lucide Icons + Leaflet | Located in `frontend/`, served by Vite dev server. Handles authentication state, routing, and rich UI widgets (maps, PDF viewer, AI cards). |
| Backend | Node.js + Express + MongoDB (Mongoose) + Multer + Cloudinary SDK | Located in `backend/`, exposes REST APIs under `/api/*`, handles auth middleware, file uploads, QR generation, and AI orchestration. |
| AI Layer | Google Gemini 2.0 Flash (`backend/services/geminiService.js`) | Consumes prescription/report content, enforces strict JSON schemas, injects disclaimers, and persists structured insights. |
| Storage | MongoDB Atlas (documents), Cloudinary (binary assets), Local file buffers (PDF parse) | Models live in `backend/models/*`. Cloudinary folders: `JeevanSetu-documents`, `JeevanSetu-prescriptions`, `JeevanSetu-test-reports`. |
| Sharing | QRCode, temporary signed links, offline payloads | Care plans and health passports embed QR codes with configurable base URLs. |

**Request flow (simplified)**
```
Patient UI ⟷ React Router ⟷ axios client → Express routes → MongoDB
                                    ↘ (uploads) Cloudinary
                                    ↘ (PDF/text payload) Gemini API → Structured AI response → MongoDB
```

---

## Repository Layout
```
Hackcbs8.0/
├── backend/                  # Express API (server, routes, models, services)
│   ├── server.js             # App bootstrap & Mongo connection
│   ├── routes/               # auth, documents, bloodBanks, carePlans, etc.
│   ├── models/               # Mongoose schemas: User, HealthRecord, CarePlan...
│   ├── services/geminiService.js
│   └── config/cloudinary.js
├── frontend/                 # React + Vite spa
│   ├── src/
│   │   ├── pages/            # Dashboard, Documents, CarePlans, TestReports...
│   │   ├── components/       # Navigation, CarePlan/TestReport modules, etc.
│   │   └── api/client.js     # Axios instance with JWT interceptor
│   └── public/               # Static assets (logo)
├── SETUP_GUIDE.md            # Extended onboarding guide
├── DEPLOYMENT.md             # Heroku/Vercel/AWS deployment recipes
└── README.md                 # You are here
```

> ℹ️ A root-level `package.json` scaffolds an experimental Next.js shell. The shipped app currently uses the dedicated `frontend/` + `backend/` workspaces.

---

## Prerequisites
- **Node.js** 18 LTS (14+ works, 18+ recommended for optional ES2022 APIs)
- **npm** 9+ (or yarn/pnpm if you adapt scripts)
- **MongoDB** (local service or Atlas cluster)
- **Cloudinary account** for secure document storage
- **Google AI Studio** (Gemini API key)
- Optional: **Heroku / Vercel / AWS CLI** for deployment, **Postman** for API testing

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Express port | `5000` |
| `MONGODB_URI` | Mongo connection string | `mongodb+srv://<user>:<pass>@cluster.mongodb.net/health` |
| `JWT_SECRET` | Token signing secret | `change_me_super_secret` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud handle | `your-cloud` |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials | `123456` / `abc123` |
| `GEMINI_API_KEY` | Google Gemini key | `AIza...` |
| `GEMINI_API_URL` | (Optional) override model endpoint | `https://generativelanguage.googleapis.com/...` |
| `CARE_PLAN_SHARE_BASE_URL` | Base URL used inside care-plan QR links | `https://app.example.com/care-plan` |
| `HEALTH_PASSPORT_SHARE_BASE_URL` | Base URL for health passport share links | `https://app.example.com` |
| `APP_BASE_URL` | Fallback base URL for generated links | `http://localhost:5173` |

Never commit real secrets—use `.env.example` patterns or secret managers for production.

### Frontend (`frontend/.env`)
| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_URL` | Base URL proxied by axios | `http://localhost:5000/api` |

---

## Local Development

1. **Clone & install**
   ```bash
   git clone <repo-url> JeevanSetu
   cd JeevanSetu/backend && npm install
   cd ../frontend && npm install
   ```
2. **Configure environment**
   - Copy the templates above into `backend/.env` & `frontend/.env`.
   - Ensure MongoDB + Cloudinary + Gemini credentials are valid.
3. **Run backend**
   ```bash
   cd backend
   npm run dev      # nodemon server.js on http://localhost:5000
   ```
4. **Run frontend**
   ```bash
   cd frontend
   npm run dev      # Vite dev server on http://localhost:5173
   ```
5. **Log in / register**
   - Visit `http://localhost:5173`, register a patient or provider, then explore each module.

> Tip: Start both servers in separate terminals. Keep `npm run dev` running to benefit from hot reload on code changes.

---

## Available Scripts

### Backend (`backend/package.json`)
- `npm run dev` – start Express via nodemon (auto reload).
- `npm start` – production start (plain `node server.js`).

### Frontend (`frontend/package.json`)
- `npm run dev` – Vite dev server with HMR.
- `npm run build` – Create production bundle in `frontend/dist`.
- `npm run preview` – Serve the built bundle locally for smoke tests.

---

## API Surface

| Domain | Method & Path | Description | Auth |
| --- | --- | --- | --- |
| Auth | `POST /api/auth/register` | Register patient/provider, returns JWT | No |
|  | `POST /api/auth/login` | Credential login, returns JWT + profile | No |
|  | `GET /api/auth/profile` | Current profile sans password | Bearer |
| Health Records | `GET /api/health-records` | List records for user | Bearer |
|  | `POST /api/health-records` | Create record (appointment, lab, etc.) | Bearer |
|  | `PUT /api/health-records/:id` | Update record | Bearer |
|  | `DELETE /api/health-records/:id` | Delete record | Bearer |
| Documents | `POST /api/documents/upload` | Upload file → Cloudinary → Mongo metadata | Bearer |
|  | `GET /api/documents` | List user docs | Bearer |
|  | `DELETE /api/documents/:id` | Remove doc + Cloudinary asset | Bearer |
| Blood Banks | `POST /api/blood-banks/create` | Providers register bank & geocoords | Bearer (provider) |
|  | `PUT /api/blood-banks/update-inventory` | Providers update units per blood type | Bearer (provider) |
|  | `GET /api/blood-banks` | Public directory with owner info | Bearer |
|  | `POST /api/blood-banks/nearby` | Geo-filtered availability search | Optional (public) |
| Care Plans | `POST /api/care-plans` | Upload prescription → Gemini → CarePlan | Bearer |
|  | `GET /api/care-plans` | List plans | Bearer |
|  | `GET/PUT/DELETE /api/care-plans/:id` | View/update/remove plan | Bearer |
|  | `PATCH /api/care-plans/:id/checklist/:checklistId` | Toggle checklist completion | Bearer |
|  | `POST /api/care-plans/:id/share` | Append family share entry | Bearer |
| Test Reports | `POST /api/test-reports` | Upload lab report → Gemini analysis | Bearer |
|  | `GET /api/test-reports` | List reports | Bearer |
|  | `GET/PUT/DELETE /api/test-reports/:id` | Manage single report | Bearer |
|  | `POST /api/test-reports/:id/share` | Track who report was shared with | Bearer |
| Health Passport | `GET /api/health-passport` | Fetch passport for owner | Bearer |
|  | `POST /api/health-passport` | Create/update passport, regenerate QR codes | Bearer |
|  | `POST /api/health-passport/share/temporary` | Generate 30-min share token + QR | Bearer |
|  | `GET /api/health-passport/share/:token` | Public read-only view used by responders | Token link |
| Utility | `GET /api/health` | Basic health-check endpoint | Public |

> All authenticated routes expect `Authorization: Bearer <token>` headers, enforced by `backend/middleware/auth.js`.

---

## Frontend Modules

- **Navigation (`src/components/Navigation.jsx`)** – Responsive nav with role-based links and logout handler.
- **Dashboard (`src/pages/Dashboard.jsx`)** – Aggregates counts from documents, care plans, blood banks, etc., and surfaces recent uploads.
- **Health Records (`src/pages/HealthRecords.jsx`)** – CRUD UI for manual entries (appointments, prescriptions, lab tests, diagnoses).
- **Documents (`src/pages/Documents.jsx`)** – Upload widget, Cloudinary-backed list, inline PDF/image previewers, tagging chips.
- **Blood Banks (`src/pages/BloodBanks.jsx`)** – Dual-mode view for patients (map + nearby search using geolocation) and providers (inventory editor).
- **Care Plans (`src/pages/CarePlans.jsx`)** – Handles prescription uploads, AI summaries, treatment plan viewers, daily checklist toggles, voice/language preferences.
- **Test Reports (`src/pages/TestReports.jsx`)** – Upload form, AI analysis cards (red flags, positives, recommendations), share tracking.
- **Health Passport (`src/pages/HealthPassport.jsx`)** – Forms for vitals/allergies, offline card downloads, QR exporters, temporary share link generation.
- **Health Passport Share (`src/pages/HealthPassportShare.jsx`)** – Public read-only card that decrypts tokenized payloads without requiring JWT.

Supporting utilities:
- `src/api/client.js` – axios instance injecting tokens.
- `src/utils/translations.js` – phrasebook powering bilingual UI + AI outputs.
- `src/components/CarePlan/*` & `src/components/TestReport/*` – modular cards, uploaders, analyzers used across the app.

---

## Deployment Notes
High-level steps (details live in [DEPLOYMENT.md](DEPLOYMENT.md)):
1. **Backend (Heroku / AWS EB / Render)**
   - Set config vars for Mongo, Cloudinary, Gemini, JWT, and share URLs.
   - Use `npm start` as the Procfile command.
   - Wire MongoDB Atlas (or DocumentDB) and enable HTTPS for geolocation APIs.
2. **Frontend (Vercel / Netlify / S3+CloudFront)**
   - Build with `npm run build`, serve `frontend/dist`.
   - Configure `VITE_API_URL` to point at the deployed backend (e.g., `https://api.jeevansetu.com/api`).
   - Enforce HTTPS so navigator.geolocation works without user friction.
3. **Health-passport share links**
   - Update `CARE_PLAN_SHARE_BASE_URL`, `HEALTH_PASSPORT_SHARE_BASE_URL`, and `APP_BASE_URL` to match the deployed front-end origin to prevent QR/code mismatches.

---

## Troubleshooting
- **Mongo connection refused** – Ensure Mongo service is running, IP whitelist includes your machine, and `MONGODB_URI` encodes credentials properly.
- **Cloudinary upload fails** – Double-check API credentials and verify the destination folder exists (`JeevanSetu-*`). Memory uploads are capped by the `50mb` body limit set in `backend/server.js`.
- **Gemini errors / invalid JSON** – Confirm API key quota status; the service expects strict JSON responses, so corrupted files or OCR noise can cause `JSON.parse` to throw. Re-upload cleaner scans or fallback to manual text input.
- **Geolocation blocked** – Browsers require secure origins (HTTPS or localhost). For staging, use `https://localhost` with certificates or deploy to an HTTPS domain.
- **Share links expired** – Temporary health passport links auto-expire after 30 minutes. Regenerate via the UI or POST `/health-passport/share/temporary`.

Refer to the **Troubleshooting** appendix inside [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting) for extended scenarios.

---

## Resources & Next Steps
- **Docs**: [SETUP_GUIDE.md](SETUP_GUIDE.md), [DEPLOYMENT.md](DEPLOYMENT.md)
- **Model schemas**: `backend/models/*.js`
- **AI pipeline**: `backend/services/geminiService.js`

Potential roadmap ideas:
1. Add automated tests (Vitest/React Testing Library frontend, Jest + supertest backend).
2. Integrate push notifications / SMS reminders for care plans.
3. Expand provider portal with appointment scheduling and analytics dashboards.
4. Package `frontend/dist` with the backend for single-command deployment.


---

_Built with ❤️ at HackCBS 8.0 to make personal healthcare more accessible, transparent, and proactive._
