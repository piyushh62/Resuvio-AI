<div align="center">

# ✨ Resuvio-AI - Open-Source AI Resume Builder & Career Assistant ✨

<p align="center">
  <a href="https://resuvio-ai.vercel.app/"><strong>🌐 Live Demo</strong></a> •
  <a href="https://github.com/piyushh62/Resuvio-AI/issues">🐞 Report Bug</a> •
  <a href="https://github.com/piyushh62/Resuvio-AI/issues/new/choose">💡 Request Feature</a> •
  <a href="https://github.com/piyushh62/Resuvio-AI/discussions">💬 Discussions</a> •
  <a href="https://github.com/piyushh62/Resuvio-AI/blob/main/docs/getting-started.md">📚 Documentation</a>
</p>

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-5.x-green)](https://expressjs.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-4285F4)](https://ai.google.dev)
[![CI](https://github.com/piyushh62/Resuvio-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/piyushh62/Resuvio-AI/actions/workflows/ci.yml)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)

<br/>

[English](README.md) | [हिंदी](README.hi.md) | [Español](README.es.md)

</div>

**Resuvio-AI** is a free and open-source **AI Resume Builder**, **ATS Resume Optimizer**, **Resume Analyzer**, **Job Matching Platform**, and **AI Cover Letter Generator** powered by Google Gemini. It helps job seekers create ATS-friendly resumes, analyze resume quality, match resumes with job descriptions, generate personalized cover letters, and streamline interview preparation using AI.

## 📸 Screenshots

| Dashboard | Resume Builder | AI Analysis | Job Matching |
|-----------|---------------|-------------|--------------|
| ![Dashboard](./docs/screenshots/dashboard.png) | ![Builder](./docs/screenshots/builder.png) | ![Analysis](./docs/screenshots/analysis.png) | ![Job Match](./docs/screenshots/job-match.png) |

## ✨ Features

- 🚀 **Modern Stack**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui
- 🧠 **AI-Powered Analysis**: Resume scoring & feedback with Gemini 2.5 Flash
- 📄 **Smart Parsing**: PDF/DOCX upload with text extraction
- 🎯 **Job Matching**: Skill gap analysis & ATS compatibility scoring
- ✍️ **Cover Letters**: Personalized generation for any job application
- 🎨 **Resume Builder**: Drag-and-drop, multiple templates, real-time preview
- 🌙 **Dark Mode**: Full theme support with persistence
- 💳 **Credits System**: Usage tracking with Razorpay payments
- 🔒 **Secure Auth**: Firebase Authentication (Email/Password, Google OAuth)
- 📱 **Responsive**: Mobile-first design, works everywhere
- ♿ **Accessible**: WCAG 2.1 AA compliant components

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, Vite 5, TypeScript 5, Tailwind CSS 3, shadcn/ui, React Router 6, TanStack Query 5, React Hook Form 7, Zod, Framer Motion, Lucide React |
| **Backend** | Node.js 20, Express 5, TypeScript 5, Firebase Admin SDK, Google Generative AI, Multer, pdf-parse, Mammoth, Razorpay |
| **Database** | Cloud Firestore (NoSQL, real-time, auto-scaling) |
| **Auth** | Firebase Authentication (client + admin SDK) |
| **AI** | Google Gemini 2.5 Flash (configurable) |
| **Payments** | Razorpay (subscriptions + one-time) |
| **Testing** | Vitest, React Testing Library, Jest, Supertest |
| **CI/CD** | GitHub Actions (lint, test, build, deploy) |
| **Hosting** | Vercel/Netlify (frontend), Cloud Run/Fly.io (backend) |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/getting-started.md) | Installation, setup, and running locally |
| [Architecture](docs/architecture.md) | System design, data flow, and technical decisions |
| [API Reference](docs/api.md) | Complete REST API documentation |
| [Deployment](docs/deployment.md) | Production deployment guides for all platforms |
| [Contributing](CONTRIBUTING.md) | Development workflow, coding standards, PR process |
| [Security](SECURITY.md) | Security policy and vulnerability reporting |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community guidelines |
| [Support](SUPPORT.md) | Help channels and troubleshooting |
| [Changelog](CHANGELOG.md) | Version history and release notes |

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x LTS
- npm 10.x (or pnpm/yarn)
- Firebase project
- Google AI Studio API key

### 1. Clone & Install
```bash
git clone https://github.com/piyushh62/Resuvio-AI.git
cd Resuvio-AI

# Install all dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 2. Configure Environment

**Frontend (`frontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Backend (`backend/.env`)**
```env
PORT=3001
FRONTEND_URL=http://localhost:8080
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
# Choose one Firebase auth method:
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
# OR
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
# OR
FIREBASE_SERVICE_ACCOUNT_BASE64=base64-encoded-json
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend (port 3001)
cd backend && npm run dev

# Terminal 2: Frontend (port 8080)
cd frontend && npm run dev
```

### 4. Open Application
Visit **http://localhost:8080** in your browser.

### 5. Optional: Firebase Emulators
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start emulators (Firestore, Auth, Functions)
firebase emulators:start --project=demo-resuvio
```

## 📦 Build & Deploy

### Frontend
```bash
cd frontend
npm run build          # Output: dist/
npm run preview        # Preview production build
```

### Backend
```bash
cd backend
npm run build          # Output: dist/
npm start              # Run production build
```

### Docker
```bash
# Frontend
docker build -t resuvio-frontend ./frontend

# Backend
docker build -t resuvio-backend ./backend

# Run with docker-compose
docker-compose up -d
```

### Deployment Platforms

| Platform | Frontend | Backend |
|----------|----------|---------|
| **Vercel** | ✅ Recommended | ❌ |
| **Netlify** | ✅ Recommended | ❌ |
| **Cloud Run** | ✅ | ✅ Recommended |
| **Fly.io** | ✅ | ✅ |
| **Render** | ✅ | ✅ |
| **VPS (PM2)** | ❌ | ✅ |

See [Deployment Guide](docs/deployment.md) for detailed instructions.

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test           # Unit tests
npm run test:ui        # Visual test UI
npm run test:coverage  # Coverage report

# Backend tests
cd backend
npm test               # Unit + integration tests
npm test -- --coverage # With coverage
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for:
- Development setup
- Coding standards
- Commit message convention (Conventional Commits)
- Pull request process
- Testing guidelines

### Quick Contribution Steps
```bash
# 1. Fork & clone
git clone https://github.com/piyushh62/Resuvio-AI.git

# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes & commit
git commit -m "feat: add amazing feature"

# 4. Push & create PR
git push origin feature/amazing-feature
```

## 🗺️ Roadmap

- [x] AI-assisted Resume Writing
- [x] Cover Letter Generation
- [x] Job Matching Engine
- [x] Resume Builder with Templates
- [x] Credits & Payment System
- [ ] Multi-language Support (i18n)
- [ ] Export to DOCX format
- [ ] More modern resume templates
- [ ] Portfolio / Link-in-bio generation
- [ ] Interview preparation module
- [ ] Browser extension for LinkedIn/Indeed
- [ ] API for third-party integrations

## 📈 Star History

<a href="https://star-history.com/#piyushh62/Resuvio-AI&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=piyushh62/Resuvio-AI&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=piyushh62/Resuvio-AI&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=piyushh62/Resuvio-AI&type=Date" />
 </picture>
</a>

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security vulnerabilities, please see our [Security Policy](SECURITY.md) and report via [GitHub Security Advisories](https://github.com/piyushh62/Resuvio-AI/security/advisories/new) or email **piyushsenjaliya1999@gmail.com**.

## 📞 Support & Community

- 📧 **Email**: piyushsenjaliya1999@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/piyushh62/Resuvio-AI/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/piyushh62/Resuvio-AI/discussions)
- 💡 **Feature Requests**: [Issue Template](https://github.com/piyushh62/Resuvio-AI/issues/new/choose)
- 📖 **Docs**: [Documentation](docs/getting-started.md)
- 🆘 **Help**: [Support Guide](SUPPORT.md)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) - Beautiful, accessible components
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Firebase](https://firebase.google.com) - Backend-as-a-service
- [Google Gemini](https://gemini](https://ai.google.dev) - Generative AI
- [Lucide](https://lucide.dev) - Clean icons
- [Vite](https://vitejs.dev) - Next-gen frontend tooling
- All [contributors](https://github.com/piyushh62/Resuvio-AI/graphs/contributors)!

## ⭐ Support the Project

If you find Resuvio-AI helps you land your dream job, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code
- 📢 Sharing with others
- ☕ [Sponsoring](https://github.com/sponsors/piyushh62)

---

<div align="center">
  <strong>Made with ❤️ by the Resuvio-AI team</strong>
  <br/>
  <sub>Empowering job seekers worldwide with AI</sub>
</div>
