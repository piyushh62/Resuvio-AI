# Getting Started with Resuvio-AI

Welcome to Resuvio-AI! This guide will help you set up the project locally for development or deploy it to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS | JavaScript runtime |
| npm | 10.x | Package manager (or pnpm/yarn) |
| Git | 2.40+ | Version control |
| Firebase CLI | Latest | Firebase emulators & deployment |

### Recommended Tools
- **VS Code** with extensions: ESLint, Prettier, TypeScript Hero
- **Docker** (for containerized development)
- **Postman** or **Insomnia** (for API testing)

### Accounts Needed
- **Firebase Project** - [Create one](https://console.firebase.google.com/)
- **Google AI Studio** - [Get Gemini API key](https://aistudio.google.com/)
- **Razorpay** (optional) - For payment integration

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/piyushh62/Resuvio-AI.git
cd Resuvio-AI

# 2. Install all dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 3. Configure environment variables
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Edit both .env files with your credentials

# 4. Start development servers
# Terminal 1 - Backend (port 3001)
cd backend && npm run dev

# Terminal 2 - Frontend (port 8080)
cd frontend && npm run dev

# 5. Open http://localhost:8080 in your browser
```

## Detailed Setup

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication**:
   - Email/Password
   - Google OAuth (configure OAuth consent screen)
4. Enable **Firestore Database**:
   - Start in production mode
   - Choose region close to your users
5. Create **Service Account**:
   - Project Settings → Service Accounts → Generate New Private Key
   - Save as `backend/serviceAccountKey.json` (gitignored)
   - Or use environment variables (see below)

### 2. Gemini AI Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add to backend `.env` as `GEMINI_API_KEY`

### 3. Frontend Configuration

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
# API
VITE_API_BASE_URL=http://localhost:3001

# Firebase (from Firebase Console → Project Settings → General)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# Server
PORT=3001
FRONTEND_URL=http://localhost:8080

# Firebase (choose ONE method)
# Method 1: Service account file (development)
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# Method 2: JSON string (production)
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...",...}

# Method 3: Base64 encoded (CI/CD)
# FIREBASE_SERVICE_ACCOUNT_BASE64=base64-encoded-json

# AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# Payments (optional)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

## Environment Configuration

### Frontend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API URL (no trailing /api) |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase App ID |

### Backend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `GOOGLE_APPLICATION_CREDENTIALS` | * | Path to service account JSON |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | * | Service account as JSON string |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | * | Base64 encoded service account |
| `GEMINI_API_KEY` | Yes | Google Gemini API Key |
| `GEMINI_MODEL` | No | Gemini model (default: gemini-2.5-flash) |
| `RAZORPAY_KEY_ID` | No | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | No | Razorpay Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | No | Razorpay Webhook Secret |

*One of the Firebase credential methods is required.

## Running the Application

### Development Mode

```bash
# Terminal 1: Backend with hot reload
cd backend
npm run dev
# Runs on http://localhost:3001

# Terminal 2: Frontend with HMR
cd frontend
npm run dev
# Runs on http://localhost:8080
```

### With Firebase Emulators (Recommended)

```bash
# Terminal 1: Start Firebase Emulators
firebase emulators:start --project=demo-resuvio

# Terminal 2: Backend (connects to emulators automatically)
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

Emulator URLs:
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099
- **UI**: http://localhost:4000

### Production Build

```bash
# Build frontend
cd frontend && npm run build
# Output: frontend/dist/

# Build backend
cd backend && npm run build
# Output: backend/dist/

# Start production backend
cd backend && npm start
```

### Docker Development

```bash
# Build images
docker-compose -f docker-compose.dev.yml build

# Start services
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## Testing

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests (if configured)
npm run test:e2e
```

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern=resume.test.ts

# Run in watch mode
npm test -- --watch
```

### Integration Tests

```bash
# Start emulators first
firebase emulators:start --project=demo-resuvio

# Run integration tests
cd backend
npm run test:integration
```

## Troubleshooting

### Common Issues

#### "Firebase configuration not found"
```bash
# Ensure service account exists
ls -la backend/serviceAccountKey.json

# Or check environment variable
echo $GOOGLE_APPLICATION_CREDENTIALS
```

#### "CORS error" in browser console
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL exactly
- Check no trailing slashes mismatch

#### "Module not found" errors
```bash
# Clear cache and reinstall
cd frontend && rm -rf node_modules package-lock.json && npm install
cd backend && rm -rf node_modules package-lock.json && npm install
```

#### "Port already in use"
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:8080 | xargs kill -9  # Frontend
```

#### TypeScript errors after pull
```bash
# Regenerate types
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

### Getting Help

- Check [SUPPORT.md](../SUPPORT.md) for more resources
- Search [GitHub Issues](https://github.com/piyushh62/Resuvio-AI/issues)
- Ask in [GitHub Discussions](https://github.com/piyushh62/Resuvio-AI/discussions)
- Join our [Discord](https://discord.gg/resuvio-ai)

---

**Next Steps**: Read [Architecture](architecture.md) to understand the codebase, or [API Reference](api.md) for endpoint details.