# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub repository structure with issue templates, PR template, and workflows
- Comprehensive CONTRIBUTING.md guidelines
- Security policy and code of conduct
- Documentation structure (getting-started, architecture, api, deployment)

### Changed
- Updated CI/CD workflows for production readiness
- Improved linting and type-checking configuration

### Fixed
- Various linting issues across frontend and backend

---

## [1.0.0] - 2024-01-15

### Added
- Initial release of Resuvio-AI
- Resume analysis with Gemini AI
- Resume builder with drag-and-drop sections
- Job matching algorithm
- Cover letter generation
- Firebase authentication (email/password, Google OAuth)
- Firestore database integration
- PDF/DOCX resume parsing
- User dashboard with activity tracking
- Credit-based usage system
- Razorpay payment integration
- Referral program
- Responsive UI with Tailwind CSS + shadcn/ui
- Dark/light theme support
- Blog system with markdown support

### Frontend
- React 18 + TypeScript + Vite
- React Router v6 for navigation
- TanStack Query for server state
- React Hook Form + Zod for validation
- Sonner for toast notifications
- Lucide React for icons
- Framer Motion for animations

### Backend
- Express 5.x + TypeScript
- Firebase Admin SDK
- Google Generative AI (Gemini)
- Multer for file uploads
- Mammoth for DOCX parsing
- pdf-parse for PDF parsing
- Jest + Supertest for testing
- ESLint flat config

---

## [0.9.0] - 2023-12-01

### Added
- Beta release for early testers
- Core resume analysis functionality
- Basic resume builder
- User authentication flow
- Initial UI components

### Changed
- Migrated from Create React App to Vite
- Updated to TypeScript strict mode

### Fixed
- PDF parsing edge cases
- Authentication token refresh issues

---

## [0.5.0] - 2023-10-15

### Added
- Alpha release
- Project initialization
- Basic project structure
- Firebase configuration
- Express server setup

---

## Release Notes Format

Each release includes:
- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes

## Versioning

This project uses [Semantic Versioning](https://semver.org/):
- **MAJOR** - Incompatible API changes
- **MINOR** - Backward-compatible functionality
- **PATCH** - Backward-compatible bug fixes

## Links

- [GitHub Releases](https://github.com/piyushh62/Resuvio-AI/releases)
- [GitHub Commits](https://github.com/piyushh62/Resuvio-AI/commits/main)