# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resuvio-AI is a full-stack web application with two main parts:

- **Frontend** (root directory): React + Vite application with TypeScript
- **Backend** (`backend/` directory): Express.js Node.js API server with TypeScript

The app helps users optimize resumes, get AI analysis, match resumes to job descriptions, and generate cover letters using Firebase Authentication and Google Generative AI.

## Key Architecture

### Frontend Architecture
- **Routing**: React Router with protected routes via `ProtectedRoute` component
- **State Management**: TanStack Query (React Query) for data fetching + React Context for auth state
- **UI**: shadcn/ui components with Tailwind CSS
- **Auth**: Firebase Client SDK (ID tokens stored in localStorage, attached via axios interceptor in `src/lib/api.ts`)
- **Path Alias**: `@` maps to `src/` directory

### Backend Architecture
- **Server**: Express.js with TypeScript, CORS enabled from `FRONTEND_URL` env var
- **Auth Middleware**: Firebase Admin SDK token verification (`backend/src/middleware/auth.middleware.ts`) — all protected routes use `requireAuth` middleware
- **Database**: Firestore (Firebase) — queries wrapped in models in `backend/src/models/`
- **File Handling**: Multer for uploads, Mammoth for DOCX parsing, pdf-parse for PDF parsing
- **AI**: Google Generative AI (`@google/generative-ai`) via `GEMINI_API_KEY`
- **Data Flow**: Routes delegate to controllers, which call models/Firebase for data

### API Structure
All routes live under `/api`:
- `/api/auth` — signup/login (public)
- `/api/resumes` — upload, list, analyze (protected)
- `/api/builder` — generate resumes, download (protected)
- `/api/match` — resume-to-job comparison (protected)
- `/api/cover-letter` — cover letter generation (protected)
- `/api/tips` — general resume tips (public)
- `/api/activity` — user activity logs (protected)
- `/api/credits` — usage/credit tracking (protected)
- `/api/payments` — payment handling (protected)

### Dashboard Routes (Frontend)
All protected and nested under `/dashboard`:
- `/dashboard` — home
- `/dashboard/analyze` — resume analysis
- `/dashboard/builder` — resume builder
- `/dashboard/job-match` — job matching
- `/dashboard/cover-letter` — cover letter generation
- `/dashboard/my-resumes` — saved resumes
- `/dashboard/help` — tips and help
- `/dashboard/referral` — referral program

### Public Routes (Frontend)
- `/` — landing page
- `/login`, `/signup` — authentication
- `/pricing` — pricing plans
- `/blog`, `/blog/:slug` — blog articles
- `/contact`, `/privacy`, `/terms`, `/cookies`, `/refund-policy` — informational pages

## Common Development Tasks

### Setup & Installation
```bash
# Install all dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Running the Project
Start both servers (in separate terminals):
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Backend runs on `http://localhost:3001`, frontend on `http://localhost:8080`.

### Building for Production
```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build
```

### Linting
```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

### Testing
```bash
# Backend (with Jest + Supertest)
cd backend && npm run test
```

## Environment Variables

### Frontend (`.env`)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (`.env`)
```
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
  # OR FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
  # OR FIREBASE_SERVICE_ACCOUNT_BASE64=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:8080
```

## Key Code Patterns

### Authentication Flow
1. User signs up/logs in via Firebase on frontend
2. Firebase returns an ID token
3. Frontend stores token in `localStorage` as `firebaseIdToken`
4. Axios interceptor (`frontend/src/lib/api.ts`) attaches token to all requests
5. Backend auth middleware (`backend/src/middleware/auth.middleware.ts`) verifies token via Firebase Admin SDK
6. Request context gains `user` property with decoded token info (`uid`, `email`, etc.)

### Adding Protected Routes
1. In frontend: Wrap route in `<ProtectedRoute>` or inside `<Route element={<ProtectedRoute />}>`
2. In backend: Add `requireAuth` middleware to route handlers
3. Access user info in controllers via `req.user.uid` or `req.user.email`

### Database Operations
- Use models in `backend/src/models/` (e.g., `resume.model.ts`)
- Models import `db` from `backend/src/config/firebase.config.ts`
- Firestore collections: `users`, `resumes`, `generatedResumes`, `coverLetters`, etc.
- User data is scoped by `uid` for isolation

### File Uploads
- Multer configured in `backend/src/config/multer.config.ts`
- Routes specify field names and file limits
- PDF parsing: use `pdf-parse` library
- DOCX parsing: use `mammoth` library

### AI Integration
- Use `@google/generative-ai` (Gemini)
- Models are instantiated per request, tokens generated fresh each time
- Responses include analysis/structured text — parse and format before returning to frontend

## Development Notes

- **Frontend imports**: Use path alias `@/` for imports (e.g., `import { Button } from '@/components/ui/button'`)
- **CORS**: Backend CORS is strict — only allows `FRONTEND_URL`. Update if frontend domain changes
- **TypeScript**: Both frontend and backend enforce strict type checking
- **Hot Reload**: Frontend uses Vite's HMR; backend uses `ts-node-dev` with auto-respawn
- **Linting**: ESLint configured for both; run before commits
- **Error Handling**: Frontend uses Sonner for toast notifications; backend returns JSON errors with status codes
- **Query State**: Use TanStack Query hooks for data fetching (e.g., `useQuery`, `useMutation`)
