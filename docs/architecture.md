# Architecture Overview

This document describes the high-level architecture, data flow, and design decisions for Resuvio-AI.

## Table of Contents
- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Authentication & Authorization](#authentication--authorization)
- [Database Design](#database-design)
- [API Design](#api-design)
- [AI Integration](#ai-integration)
- [File Handling](#file-handling)
- [Deployment Architecture](#deployment-architecture)
- [Security Considerations](#security-considerations)
- [Scalability](#scalability)

## System Overview

Resuvio-AI is a full-stack career tooling application with a **React/Vite frontend** and **Express/TypeScript backend**, using **Firebase** for authentication and database, and **Google Gemini** for AI capabilities.

```
┌─────────────────┐     HTTPS/REST      ┌─────────────────┐
│   Frontend      │ ◄─────────────────► │   Backend       │
│   (React/Vite)  │                     │   (Express/TS)  │
│   Port: 8080    │                     │   Port: 3001    │
└────────┬────────┘                     └────────┬────────┘
         │                                       │
         │ Firebase Auth                         │ Firebase Admin
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│  Firebase       │                     │  Firestore      │
│  Authentication │                     │  Database       │
└─────────────────┘                     └─────────────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│  Google Gemini  │                     │  Firebase       │
│  AI (Generative)│                     │  Storage        │
└─────────────────┘                     └─────────────────┘
```

## Technology Stack

### Frontend
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | React | 18.x | UI library |
| Build Tool | Vite | 5.x | Fast dev server & bundler |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| UI Components | shadcn/ui | Latest | Accessible component library |
| Routing | React Router | 6.x | Client-side routing |
| State Management | TanStack Query | 5.x | Server state management |
| Auth Context | React Context | - | Client-side auth state |
| Forms | React Hook Form | 7.x | Form handling |
| Validation | Zod | 3.x | Schema validation |
| Notifications | Sonner | 1.x | Toast notifications |
| Icons | Lucide React | 0.x | Icon library |
| Date Handling | date-fns | 3.x | Date formatting |
| PDF Generation | jsPDF | 2.x | Client-side PDF export |

### Backend
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Express | 5.x | Web framework |
| Language | TypeScript | 5.x | Type safety |
| Runtime | Node.js | 20.x LTS | JavaScript runtime |
| Database | Firestore | - | NoSQL database |
| Auth | Firebase Admin | 12.x | Server-side auth |
| AI | @google/generative-ai | 0.x | Gemini AI integration |
| File Upload | Multer | 1.x | Multipart form handling |
| PDF Parsing | pdf-parse | 1.x | PDF text extraction |
| DOCX Parsing | Mammoth | 1.x | DOCX text extraction |
| Payments | Razorpay | 2.x | Payment processing |
| Testing | Jest + ts-jest | 29.x | Unit/integration testing |
| Linting | ESLint | 8.x | Code quality |
| Formatting | Prettier | 3.x | Code formatting |

### Infrastructure
| Category | Technology | Purpose |
|----------|------------|---------|
| Hosting (Frontend) | Vercel/Netlify | Static hosting + CDN |
| Hosting (Backend) | Cloud Run/Fly.io/Render | Container hosting |
| Database | Firestore | Managed NoSQL |
| Auth | Firebase Auth | Managed authentication |
| AI | Google Gemini | Generative AI |
| CI/CD | GitHub Actions | Automation |
| Monitoring | (TBD) | Error tracking, analytics |

## Project Structure

```
Resuvio-AI/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
├── docs/
│   ├── getting-started.md
│   ├── architecture.md
│   ├── api.md
│   └── deployment.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── builder/         # Resume builder components
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   └── landing/         # Landing page components
│   │   ├── pages/               # Route components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # React Context providers
│   │   ├── lib/                 # Utilities & configs
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Helper functions
│   │   ├── App.tsx              # Root component + routing
│   │   └── main.tsx             # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Express middleware
│   │   ├── models/              # Firestore models
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic & external services
│   │   ├── types/               # TypeScript types
│   │   ├── tests/               # Test files
│   │   └── server.ts            # Entry point
│   ├── functions/               # Firebase Functions (stub)
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Data Flow

### 1. User Authentication Flow

```
User → Frontend (Firebase Client SDK) → Firebase Auth → ID Token
                                                      │
                                                      ▼
Frontend (localStorage) ←────────────────────────── ID Token
                                                      │
                                                      ▼
                    Axios Interceptor (Authorization: Bearer <token>)
                                                      │
                                                      ▼
                    Backend (Firebase Admin SDK) ←─── Verify Token
                                                      │
                                                      ▼
                    Request Context (req.user: {uid, email, ...})
```

### 2. Resume Analysis Flow

```
User uploads resume (PDF/DOCX)
         │
         ▼
Frontend: POST /api/resumes/upload (multipart/form-data)
         │
         ▼
Backend: Multer → Memory buffer → pdf-parse/mammoth → Text extraction
         │
         ▼
Backend: Store in Firestore (resumes collection)
         │
         ▼
User clicks "Analyze"
         │
         ▼
Frontend: POST /api/resumes/:id/analyze
         │
         ▼
Backend: Retrieve resume → Build prompt → Call Gemini AI
         │
         ▼
Backend: Parse AI response → Store analysis → Return structured data
         │
         ▼
Frontend: Display analysis results
```

### 3. Resume Builder Flow

```
User creates/edits resume in builder
         │
         ▼
Frontend: useResumeHistory hook (undo/redo state)
         │
         ▼
User clicks "Save" or "Generate PDF"
         │
         ▼
Frontend: POST /api/builder/workspace (save draft)
         │
         ▼
Backend: Store in Firestore (generatedResumes collection)
         │
         ▼
User clicks "Download PDF"
         │
         ▼
Frontend: GET /api/builder/download/:id
         │
         ▼
Backend: Generate PDF with jsPDF → Return binary
         │
         ▼
Frontend: Trigger browser download
```

## Authentication & Authorization

### Firebase Authentication (Client-Side)
- **Providers**: Email/Password, Google OAuth
- **Token Management**: ID tokens stored in `localStorage` as `firebaseIdToken`
- **Token Refresh**: Automatic via Firebase SDK
- **Session Persistence**: `localStorage` (survives browser close)

### Backend Authorization (Server-Side)
```typescript
// middleware/auth.middleware.ts
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // { uid, email, email_verified, ... }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

### Protected Routes
All `/api/*` routes (except `/api/auth/*`, `/api/tips`) require authentication.

### Route Protection (Frontend)
```tsx
// components/ProtectedRoute.tsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard/*" element={<DashboardLayout />} />
</Route>
```

## Database Design

### Firestore Collections

```
users/{uid}
├── email: string
├── displayName: string
├── photoURL: string
├── createdAt: timestamp
├── plan: 'free' | 'pro' | 'enterprise'
├── creditsUsed: number
├── creditsLimit: number
├── referralCode: string
├── referredBy: string?
└── settings: { theme, notifications, ... }

resumes/{resumeId}
├── userId: string (uid)
├── fileName: string
├── fileType: 'pdf' | 'docx'
├── fileSize: number
├── extractedText: string
├── uploadUrl: string (Firebase Storage)
├── createdAt: timestamp
├── updatedAt: timestamp
└── analyses: subcollection
    └── {analysisId}
        ├── resumeId: string
        ├── userId: string
        ├── score: number
        ├── feedback: string
        ├── suggestions: string[]
        ├── keywords: string[]
        ├── createdAt: timestamp

generatedResumes/{resumeId}
├── userId: string
├── title: string
├── template: string
├── data: ResumeData (JSON)
├── pdfUrl: string?
├── isDraft: boolean
├── createdAt: timestamp
├── updatedAt: timestamp

coverLetters/{letterId}
├── userId: string
├── jobDescription: string
├── resumeId: string?
├── generatedText: string
├── createdAt: timestamp

activity/{activityId}
├── userId: string
├── type: 'resume_upload' | 'analysis' | 'builder_save' | 'cover_letter' | 'job_match'
├── description: string
├── metadata: object
├── createdAt: timestamp

credits/{uid}
├── userId: string
├── used: number
├── limit: number
├── plan: string
├── resetDate: timestamp
├── history: subcollection
    └── {historyId}
        ├── amount: number
        ├── type: 'usage' | 'purchase' | 'refund' | 'bonus'
        ├── description: string
        ├── createdAt: timestamp

referrals/{referralCode}
├── code: string
├── referrerId: string
├── referredId: string?
├── status: 'pending' | 'completed' | 'expired'
├── reward: number
├── createdAt: timestamp
├── completedAt: timestamp?
```

### Indexes Required

```javascript
// Firestore indexes (create via console or firebase.json)
[
  { collection: 'resumes', fields: [{ field: 'userId', order: 'ASC' }, { field: 'createdAt', order: 'DESC' }] },
  { collection: 'generatedResumes', fields: [{ field: 'userId', order: 'ASC' }, { field: 'updatedAt', order: 'DESC' }] },
  { collection: 'coverLetters', fields: [{ field: 'userId', order: 'ASC' }, { field: 'createdAt', order: 'DESC' }] },
  { collection: 'activity', fields: [{ field: 'userId', order: 'ASC' }, { field: 'createdAt', order: 'DESC' }] },
  { collection: 'credits', fields: [{ field: 'userId', order: 'ASC' }] },
]
```

## API Design

### RESTful Conventions

| Resource | Methods | Description |
|----------|---------|-------------|
| `/api/auth` | POST | Authentication endpoints |
| `/api/resumes` | GET, POST, DELETE | Resume CRUD |
| `/api/resumes/:id/analyze` | POST | AI analysis |
| `/api/builder` | GET, POST | Resume builder workspaces |
| `/api/builder/workspace/:id` | GET, DELETE, POST (duplicate) | Workspace operations |
| `/api/builder/download/:id` | GET | PDF download |
| `/api/match` | POST | Job matching |
| `/api/cover-letter` | POST | Cover letter generation |
| `/api/tips` | GET | Resume tips (public) |
| `/api/activity` | GET | User activity log |
| `/api/credits` | GET | Credit usage & limits |
| `/api/payments` | POST | Payment processing |

### Request/Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Pagination
```typescript
// Query params
interface PaginationParams {
  page?: number;      // default: 1
  limit?: number;     // default: 10, max: 50
  sortBy?: string;    // field name
  sortOrder?: 'asc' | 'desc';
}

// Response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Rate Limiting
- **Authenticated**: 100 requests/minute
- **Public endpoints**: 30 requests/minute
- **AI endpoints**: 10 requests/minute (stricter due to cost)

## AI Integration

### Gemini AI Service

```typescript
// services/ai.service.ts
class AIService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' 
    });
  }
  
  async generateContent(prompt: string, schema?: Schema): Promise<any> {
    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    return this.parseResponse(response, schema);
  }
}
```

### Prompt Engineering Patterns

1. **Structured Output**: Use JSON schema in prompts
2. **Few-shot Examples**: Include 2-3 examples in prompt
3. **Chain of Thought**: Ask model to reason step-by-step
4. **Fallback Parsing**: Regex extraction for malformed JSON

### AI Endpoints & Credit Costs

| Endpoint | Operation | Credits |
|----------|-----------|---------|
| `/api/resumes/:id/analyze` | Resume analysis | 5 |
| `/api/match/resume-job` | Job matching | 3 |
| `/api/cover-letter/generate` | Cover letter | 2 |
| `/api/builder/generate` | Resume generation | 5 |
| `/api/builder/assist` | AI assistance | 1 |
| `/api/builder/parse-upload` | Resume parsing | 2 |

## File Handling

### Upload Flow
```
Client → Multer (memory storage) → Buffer → 
  ├─ PDF: pdf-parse → text
  └─ DOCX: mammoth → text
       ↓
Firestore (metadata + extracted text)
       ↓
Firebase Storage (original file)
```

### Configuration
```typescript
// config/multer.config.ts
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

### Supported Formats
- **PDF**: Up to 10 pages, text extraction via `pdf-parse`
- **DOCX**: Text extraction via `mammoth`
- **Max Size**: 5MB

## Deployment Architecture

### Development
```
Local Machine
├── Frontend: Vite dev server (port 8080)
├── Backend: ts-node-dev (port 3001)
├── Firebase Emulators (ports 8080, 9099, 4000)
└── Docker Compose (optional)
```

### Staging
```
GitHub Actions CI
    │
    ▼
Build & Test
    │
    ▼
Docker Images → GHCR
    │
    ▼
Deploy to Staging (Cloud Run / Fly.io / Render)
    │
    ▼
Smoke Tests
```

### Production
```
Git Tag (v1.2.3)
    │
    ▼
Release Workflow
    │
    ▼
Build & Test
    │
    ▼
Docker Images → GHCR (tagged)
    │
    ▼
Deploy to Production
    │
    ▼
Health Checks
    │
    ▼
GitHub Release Created
```

### Environment-Specific Config

| Config | Development | Staging | Production |
|--------|-------------|---------|------------|
| Frontend URL | localhost:8080 | staging.resuvio.ai | resuvio-ai.vercel.app |
| Backend URL | localhost:3001 | api-staging.resuvio.ai | resuvio-ai.onrender.com |
| Firebase | Demo project | Staging project | Production project |
| Gemini | Test key | Staging key | Production key |
| Log Level | debug | info | warn |

## Security Considerations

### Implemented
- ✅ Firebase ID token verification on all protected routes
- ✅ CORS restricted to `FRONTEND_URL`
- ✅ Helmet.js for security headers
- ✅ Input validation with Zod schemas
- ✅ File type/size validation on upload
- ✅ Environment variables for secrets
- ✅ Service account keys gitignored
- ✅ Rate limiting on AI endpoints
- ✅ No sensitive data in client bundle

### Recommended Enhancements
- [ ] API key rotation strategy
- [ ] Request/response logging (audit trail)
- [ ] WAF rules for production
- [ ] Dependency scanning (Snyk/Dependabot)
- [ ] Penetration testing
- [ ] CSP headers for frontend
- [ ] Secure cookie flags for session management

## Scalability

### Current Bottlenecks
1. **AI API calls** - Synchronous, rate-limited by Gemini
2. **Firestore reads/writes** - Pay per operation
3. **PDF generation** - CPU intensive, synchronous
4. **File uploads** - Memory-based (Multer memory storage)

### Scaling Strategies

| Component | Strategy |
|-----------|----------|
| Backend API | Horizontal scaling (stateless), Cloud Run auto-scaling |
| AI Processing | Queue-based (Cloud Tasks/Bull), async processing |
| Database | Firestore auto-scales, use composite indexes |
| File Storage | Firebase Storage (CDN-backed) |
| Frontend | Static hosting + CDN (Vercel/Netlify/Cloudflare) |
| Caching | Redis for session/cache, CDN for static assets |

### Future Architecture (Microservices)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Gateway   │────►│   Auth      │     │   User      │
│   (Kong/    │     │   Service   │     │   Service   │
│   API GW)   │     └─────────────┘     └─────────────┘
└─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Resume     │     │   AI        │     │  Payment    │
│  Service    │     │  Service    │     │  Service    │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

*Last updated: 2024 | Version: 1.0*