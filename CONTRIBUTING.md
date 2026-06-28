# Contributing to Resuvio-AI

Thank you for your interest in contributing to Resuvio-AI! This document provides guidelines and best practices for contributing to this project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Security](#security)
- [Getting Help](#getting-help)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to piyushsenjaliya1999@gmail.com.

## Getting Started

### Prerequisites

- **Node.js**: v20.x LTS (recommended)
- **Package Manager**: npm v10.x, pnpm v8.x, or yarn v4.x
- **Git**: v2.40+
- **Firebase CLI**: `npm install -g firebase-tools` (for backend development)
- **Docker**: v24+ (optional, for containerized development)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/piyushh62/Resuvio-AI.git
cd Resuvio-AI

# Install all dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Set up environment variables
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Edit .env files with your configuration

# Start development servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## Development Setup

### Frontend (Vite + React + TypeScript)

```bash
cd frontend

# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

### Backend (Express + TypeScript + Firebase)

```bash
cd backend

# Install dependencies
npm install

# Start development server with hot reload (port 3001)
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build for production
npm run build

# Start production server
npm start
```

### Firebase Emulators (Recommended for Local Development)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulators
firebase emulators:start --project=demo-resuvio

# This starts:
# - Authentication emulator (port 9099)
# - Firestore emulator (port 8080)
# - Functions emulator (port 5001)
# - Hosting emulator (port 5000)
# - UI (port 4000)
```

### Environment Variables

#### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### Backend (`.env`)
```env
PORT=3001
FRONTEND_URL=http://localhost:8080
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
# OR
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
# OR
FIREBASE_SERVICE_ACCOUNT_BASE64=base64-encoded-json
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

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
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── builder/      # Resume builder components
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   └── landing/      # Landing page components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # React Context providers
│   │   ├── lib/              # Utilities & configurations
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Helper functions
│   ├── public/               # Static assets
│   └── ...
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Firestore models
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic & external services
│   │   ├── types/            # TypeScript types
│   │   └── tests/            # Test files
│   └── ...
├── backend/functions/        # Firebase Functions (stub)
└── ...
```

## Development Workflow

### Branch Strategy

We follow a simplified **GitHub Flow**:

```
main (protected)
  │
  ├── feature/feature-name     # New features
  ├── fix/bug-description      # Bug fixes
  ├── docs/update-description  # Documentation updates
  ├── refactor/component-name  # Code refactoring
  ├── chore/dependency-update  # Maintenance tasks
  └── release/v1.2.3           # Release preparation
```

### Creating a Feature Branch

```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes, commit often
git add .
git commit -m "feat: add amazing feature"

# Push to origin
git push origin feature/amazing-feature

# Create Pull Request on GitHub
```

### Commit Message Convention

We follow **Conventional Commits** (Angular style):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding missing tests or correcting existing tests |
| `chore` | Maintenance, dependencies, build config |
| `build` | Build system or external dependencies |
| `ci` | CI configuration changes |

#### Examples
```bash
feat(auth): add Google OAuth integration
fix(resume): handle PDF parsing error for corrupted files
docs(api): update resume analysis endpoint documentation
refactor(builder): extract resume validation logic to service
test(match): add unit tests for job matching algorithm
chore(deps): update react to v18.2.0
```

### Pull Request Process

1. **Create PR** from your feature branch to `main`
2. **Fill out the PR template** completely
3. **Ensure CI passes** (lint, type-check, tests, build)
4. **Request review** from maintainers
5. **Address feedback** with additional commits
6. **Squash and merge** after approval

#### PR Requirements
- [ ] All CI checks pass
- [ ] At least 1 approval from maintainers
- [ ] No merge conflicts with `main`
- [ ] CHANGELOG.md updated (under "Unreleased")
- [ ] Documentation updated if user-facing changes
- [ ] Tests added/updated for new functionality

## Coding Standards

### TypeScript
- Use **strict mode** (enabled in tsconfig.json)
- Prefer **type inference** over explicit types when obvious
- Use **interfaces** for object shapes, **types** for unions/primitives
- Avoid `any` - use `unknown` or proper types
- Use **readonly** for immutable data

```typescript
// Good
interface ResumeData {
  readonly id: string;
  readonly personalInfo: PersonalInfo;
  readonly experience: readonly Experience[];
}

// Avoid
const data: any = fetchData();
```

### React / Frontend
- Use **functional components** with hooks
- Prefer **composition** over inheritance
- Use **custom hooks** for reusable logic
- Follow **shadcn/ui** patterns for UI components
- Use **TanStack Query** for server state
- Keep components **small and focused**

```tsx
// Good - Custom hook for data fetching
function useResumeAnalysis(resumeId: string) {
  return useQuery({
    queryKey: ['resume-analysis', resumeId],
    queryFn: () => api.get(`/resumes/${resumeId}/analyze`),
    enabled: !!resumeId,
  });
}

// Component uses hook
function ResumeAnalysis({ resumeId }: { resumeId: string }) {
  const { data, isLoading } = useResumeAnalysis(resumeId);
  // ...
}
```

### Backend / Node.js
- Use **async/await** over promises
- Handle errors with **try/catch** or error-handling middleware
- Validate input with **Zod** or similar
- Use **dependency injection** for services
- Follow **controller → service → model** pattern

```typescript
// Good - Controller delegates to service
export const analyzeResume = async (req: Request, res: Response) => {
  try {
    const result = await resumeService.analyze(req.user.uid, req.params.id);
    res.json(result);
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

### Code Style
- **ESLint** + **Prettier** enforced via CI
- **2 spaces** indentation
- **Single quotes** for strings
- **Trailing commas** (es5)
- **Semicolons** required
- **Max line length**: 100 characters

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `resume-builder.tsx` |
| Components | PascalCase | `ResumeBuilder.tsx` |
| Hooks | camelCase + `use` | `useResumeHistory.ts` |
| Functions | camelCase | `analyzeResume()` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Types/Interfaces | PascalCase | `ResumeData` |
| Enums | PascalCase | `ResumeStatus` |

## Testing Guidelines

### Frontend Testing
- **Unit tests**: Vitest + React Testing Library
- **Component tests**: Test user interactions, not implementation
- **Integration tests**: Test API integration with MSW
- **E2E tests**: Playwright (for critical flows)

```tsx
// Good component test
test('renders resume score card with correct data', () => {
  render(<ResumeScoreCard score={85} />);
  expect(screen.getByText('85')).toBeInTheDocument();
  expect(screen.getByText('Good')).toBeInTheDocument();
});
```

### Backend Testing
- **Unit tests**: Jest + ts-jest for services/utils
- **Integration tests**: Supertest for API endpoints
- **Mock external services** (Firebase, Gemini AI)
- **Test database**: Use Firestore emulator

```typescript
// Good integration test
describe('POST /api/resumes/upload', () => {
  it('should upload and parse PDF resume', async () => {
    const response = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${validToken}`)
      .attach('resume', 'test/fixtures/sample-resume.pdf')
      .expect(201);
    
    expect(response.body.resumeId).toBeDefined();
  });
});
```

### Test Coverage Targets
- **Frontend**: >80% statements, >70% branches
- **Backend**: >85% statements, >75% branches

## Documentation

### When to Update Documentation
- New API endpoints → `docs/api.md`
- New features → `docs/getting-started.md` or feature-specific docs
- Architecture changes → `docs/architecture.md`
- Deployment changes → `docs/deployment.md`
- User-facing changes → `README.md`

### Documentation Style
- Use **clear headings** and **table of contents**
- Include **code examples** for API usage
- Keep **up-to-date** with code changes
- Use **relative links** for internal references

## Security

### Reporting Security Issues
**DO NOT** create public issues for security vulnerabilities. Instead:
1. Email: piyushsenjaliya1999@gmail.com
2. Use GitHub Security Advisories (private)
3. Include: description, impact, reproduction steps, suggested fix

### Security Best Practices
- Never commit secrets, API keys, or credentials
- Use environment variables for all configuration
- Validate and sanitize all user inputs
- Keep dependencies updated (Dependabot handles this)
- Follow OWASP Top 10 guidelines

## Getting Help

- **Documentation**: Check `docs/` folder first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community server (link in README)
- **Email**: piyushsenjaliya1999@gmail.com for maintainer contact

## Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md` (auto-generated)
- Release notes
- GitHub contributors graph

Thank you for contributing to Resuvio-AI! 🚀