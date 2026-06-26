# Resuvio-AI Agent Instructions

These instructions help coding agents work productively in this repository. Prefer reading the linked docs for broad context, but keep these repository-specific facts and conventions in mind before editing or running commands.

## Project overview

Resuvio-AI is a full-stack career tooling app:

- **Frontend:** `frontend/` — Vite + React 18 + TypeScript + Tailwind + shadcn/ui + React Router + TanStack Query.
- **Backend:** `backend/` — Express **5.x** + TypeScript + Firebase Admin + Firestore + Gemini AI (`@google/generative-ai`) + Multer.
- **Firebase Functions stub:** `backend/functions/` — configured but currently exports no functions.

Run commands from the relevant package directory; there are no root scripts.

## Build, test, and dev commands

| Area | Command | Notes |
| --- | --- | --- |
| Frontend dev | `cd frontend && npm run dev` | Vite dev server is configured on port `8080`. |
| Frontend build | `cd frontend && npm run build` | Vite outputs `dist/`. |
| Frontend lint | `cd frontend && npm run lint` | ESLint flat config. |
| Backend dev | `cd backend && npm run dev` | `ts-node-dev --respawn --transpile-only src/server.ts`. |
| Backend build | `cd backend && npm run build` | TypeScript CommonJS emit to `dist/`. |
| Backend start | `cd backend && npm start` | Runs `node dist/server.js`. |
| Backend tests | `cd backend && npm test` | Jest + ts-jest under `backend/src/tests`. |
| Backend lint | `cd backend && npm run lint` | ESLint flat config (`eslint.config.mjs`). |
| Functions build | `cd backend/functions && npm run build` | Firebase Functions package. |
| Functions deploy | `cd backend/functions && npm run deploy` | Currently likely no-op because no functions are exported. |

## Architecture boundaries

### Frontend

Key files:

- `frontend/src/main.tsx` mounts the app inside `AuthProvider`.
- `frontend/src/App.tsx` owns routing.
- `frontend/src/components/ProtectedRoute.tsx` gates `/dashboard/*`.
- `frontend/src/lib/api.ts` is the shared Axios client.
- `frontend/src/lib/firebase.ts` initializes Firebase client Auth only.
- `frontend/src/context/AuthContext.tsx` tracks Firebase auth and stores ID tokens in `localStorage` as `firebaseIdToken`.
- `frontend/src/pages/*` contain feature pages.
- `frontend/src/components/ui/*` are generated shadcn/ui components; avoid manually editing generated UI primitives unless intentionally updating shadcn conventions.
- `frontend/vite.config.ts` includes the `lovable-tagger` plugin in development mode (used for component tagging; can be safely ignored).
- `frontend/src/hooks/useResumeHistory.ts` provides undo/redo state management for the resume builder workspace.

Routes:

- Public: `/`, `/login`, `/signup`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/refund-policy`, `/pricing`, `/blog`, `/blog/:slug`.
- Redirects: `/analyze` → `/dashboard/analyze`, `/builder` → `/dashboard/builder`, `/job-match` → `/dashboard/job-match`.
- Protected dashboard: `/dashboard/*` with sub-routes:
  - `/dashboard` (index) → `DashboardHome`
  - `/dashboard/analyze` → `AnalyzeResume`
  - `/dashboard/builder` → `ResumeBuilder`
  - `/dashboard/job-match` → `JobMatch`
  - `/dashboard/cover-letter` → `CoverLetterGenerator`
  - `/dashboard/my-resumes` → `MyResumes`
  - `/dashboard/help` → `HelpAndTips`
  - `/dashboard/referral` → `ReferralPage`

### Backend

Key files:

- `backend/src/server.ts` creates the Express app and mounts routes.
- `backend/src/config/firebase.config.ts` initializes Firebase Admin.
- `backend/src/middleware/auth.middleware.ts` verifies `Authorization: Bearer <firebase-id-token>`.
- `backend/src/config/multer.config.ts` configures memory-based PDF/DOCX uploads.
- `backend/src/controllers/*` contain request handlers and AI calls.
- `backend/src/routes/*` map endpoints to controllers.
- `backend/src/models/*` define Firestore document shapes (`Resume`, `GeneratedResume`, `ResumeInputData`).
- `backend/src/middleware/auth.middleware.ts` exports both `authenticateToken` and its alias `requireAuth`.

Mounted API routes:

- `/api/auth`
- `/api/resumes`
- `/api/builder`
- `/api/match`
- `/api/tips`
- `/api/cover-letter`
- `/api/activity`
- `/api/credits`
- `/api/payments`

## Environment variables

### Frontend actual variables

Actual code expects:

- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Important: ~~README documents `VITE_BACKEND_API_URL`~~ — **FIXED**: README now correctly documents `VITE_API_BASE_URL`.

Recommended local value:

```env
VITE_API_BASE_URL=http://localhost:3001
```

Do not include `/api` in `VITE_API_BASE_URL` unless frontend API paths are changed, because calls already include `/api/...`.

### Backend actual variables

Actual code expects:

- `PORT` — defaults to `3001` in `server.ts`.
- `FRONTEND_URL` — used for CORS origin.
- `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_BASE64`.
- `GEMINI_API_KEY`
- `GEMINI_MODEL` — defaults to `gemini-2.5-flash`.

Important: ~~README documents `GOOGLE_API_KEY`~~ — **FIXED**: README now correctly documents `GEMINI_API_KEY`.

## Security-sensitive findings

Treat these as high-priority issues:

1. **~~Committed Firebase service account keys exist~~ (FIXED)**
   - `backend/serviceAccountKey.json` and `backend/1serviceAccountKey.json` have been deleted.
   - `*serviceAccountKey*.json` is listed in `backend/.gitignore` to prevent re-committing.

2. **~~Resume upload route is not authenticated~~ (FIXED)**
   - All resume routes (`GET /`, `POST /upload`, `POST /:resumeId/analyze`) apply `authenticateToken`.
   - Dead-code anonymous fallback (`req.user ? req.user.uid : 'anonymous'`) has been removed from `resume.controller.ts`.
   - Controllers now return 401 if `req.user` is missing.

3. **AI response parsing is brittle**
   - Gemini responses are parsed with regex JSON extraction in `builder.controller.ts` (`parseJsonFromText`), `resume.controller.ts`, and `match.controller.ts`.
   - Each controller independently instantiates `GoogleGenerativeAI` and `model` at module scope (duplicated across 4 controllers: `resume`, `builder`, `match`, `coverLetter`).
   - Prefer centralized AI client initialization, explicit JSON-only prompts, schema validation, and safer fallback behavior.

4. **Token storage**
   - Frontend stores Firebase ID tokens in `localStorage`.
   - This works for the current design, but avoid introducing stronger security claims unless the implementation changes.

## API contract notes

Frontend calls include `/api/...` paths:

- `POST /api/resumes/upload`
- `POST /api/resumes/:id/analyze`
- `POST /api/match/resume-job`
- `POST /api/cover-letter/generate` (uses `requireAuth`, an alias of `authenticateToken`)
- `POST /api/builder/generate`
- `POST /api/builder/workspace`
- `GET /api/builder/generated`
- `GET /api/builder/workspaces`
- `GET /api/builder/workspace/:id`
- `POST /api/builder/assist`
- `POST /api/builder/parse-upload`
- `GET /api/builder/download/:id`
- `DELETE /api/builder/workspace/:id` — Delete a resume workspace.
- `POST /api/builder/workspace/:id/duplicate` — Duplicate a resume workspace.
- `GET /api/activity/recent`
- `GET /api/tips` — No authentication required (intentional; auth middleware is commented out in `tips.routes.ts`).
- `GET /api/credits/usage` — Get current user's usage
- `GET /api/credits/limits` — Get credit limits for all plans (public)
- `POST /api/payments/create-order` — Create Razorpay order
- `POST /api/payments/verify` — Verify payment signature
- `GET /api/payments/status` — Get current subscription status
- `POST /api/auth/signup`
- `POST /api/auth/login` is a 501 placeholder; login is handled client-side.

## Common pitfalls

- ~~Vite dev server is configured for port `8080`, while README examples mention `5173`~~ — **FIXED**: README now correctly references port `8080` and the `frontend` directory.
- ~~`frontend/netlify.toml` publishes `build`~~ — **FIXED**: now correctly publishes `dist`.
- ~~`frontend/windsurf_deployment.yaml` labels the app as Create React App~~ — **FIXED**: now correctly says `vite`.
- ~~`frontend/src/pages/Index.tsx` is not used by routing~~ — **FIXED**: file has been deleted.
- ~~`SignInPromptModal` navigates to `/register`~~ — **FIXED**: now correctly navigates to `/signup`.
- ~~`frontend/index.html` includes `gptengineer.js`~~ — **FIXED**: the external script has been removed.
- ~~`frontend/src/utils/resumeUtils.ts` contains unused mock functions~~ — **FIXED**: file has been deleted.
- Backend uses **Express 5.x** (`express@^5.1.0`); `req.params` values are typed as `string | string[]` — cast to `string` when using with Firestore `.doc()`.
- ~~Backend `npm run lint` was broken (ESLint not installed)~~ — **FIXED**: ESLint + `@typescript-eslint` installed with flat config (`eslint.config.mjs`).
- Generated resume PDFs are simple text renders and may truncate long content.
- Activity endpoint (`/api/activity/recent`) returns hardcoded mock data inline in the route file.
- Tips endpoint (`/api/tips`) returns data from the controller without authentication (intentional).
- Firestore client/Storage client SDK imports are commented out in `frontend/src/lib/firebase.ts`.

## Editing guidance

- Keep frontend and backend changes scoped to their package directories.
- Respect existing module systems: frontend uses ESM; backend uses CommonJS output.
- Preserve existing route/controller/middleware boundaries unless intentionally refactoring.
- Prefer small, testable changes and update affected types when API payloads change.
- When changing environment variable names, update both code and README.
- Before shipping backend auth changes, update route middleware and controller fallback behavior together.
- When improving AI features, centralize Gemini configuration and response parsing where practical (currently each controller creates its own `GoogleGenerativeAI` instance).

## Relevant documentation

- General project overview and setup: [`README.md`](../README.md)
- Frontend package scripts and dependencies: [`frontend/package.json`](../frontend/package.json)
- Backend package scripts and dependencies: [`backend/package.json`](../backend/package.json)