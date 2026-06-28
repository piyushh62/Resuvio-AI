# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of these channels:

### Preferred: GitHub Security Advisories
1. Go to the [Security tab](https://github.com/piyushh62/Resuvio-AI/security) of this repository
2. Click "Report a vulnerability"
3. Fill in the details privately

### Alternative: Email
Send details to: **piyushsenjaliya1999@gmail.com**

### What to Include
Please provide as much information as possible:
- **Description** of the vulnerability
- **Impact** assessment (what could an attacker do?)
- **Steps to reproduce** the issue
- **Affected versions** (if known)
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

## Response Timeline

| Phase | Timeline |
|-------|----------|
| Acknowledgment | Within 48 hours |
| Initial Assessment | Within 5 business days |
| Fix Development | Within 30 days (critical), 90 days (non-critical) |
| Public Disclosure | After fix is deployed + 14 days |

## Security Best Practices

### For Users
- Keep your dependencies updated
- Use strong, unique passwords
- Enable 2FA on your Firebase/Google account
- Don't share API keys or service account credentials
- Report suspicious activity immediately

### For Contributors
- Never commit secrets, API keys, or credentials
- Use environment variables for all configuration
- Validate and sanitize all user inputs
- Follow OWASP Top 10 guidelines
- Run `npm audit` regularly
- Keep dependencies updated (Dependabot helps with this)

## Known Security Considerations

### Authentication
- Firebase ID tokens stored in localStorage (client-side)
- Tokens transmitted via HTTPS only
- Backend verifies tokens with Firebase Admin SDK
- No refresh token storage on client

### Data Protection
- User data isolated by UID in Firestore
- Resume files processed in memory (not stored permanently)
- No PII logged in application logs
- CORS restricted to configured frontend URL

### AI Integration
- Gemini API key stored in backend environment only
- Prompts sanitized before sending to AI
- AI responses validated before returning to client
- No user data used for model training

### File Uploads
- Only PDF and DOCX files accepted
- File size limited (10MB default)
- Files processed in memory, not written to disk
- MIME type validation

## Security Headers (Backend)

The following security headers are set via Helmet.js:
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

## Dependency Security

- **Dependabot** configured for weekly updates
- **npm audit** runs in CI pipeline
- **Snyk** integration available (optional)
- Major version updates require manual review

## Disclosure Policy

We follow responsible disclosure:
1. Vulnerability reported privately
2. We acknowledge and assess
3. We develop and test a fix
4. We deploy the fix
5. We publish a security advisory (after 14 days)
6. Credit given to reporter (if desired)

## Hall of Fame

Thank you to security researchers who have helped improve Resuvio-AI:

- *No reports yet - be the first!*

## Contact

- **Security Email**: piyushsenjaliya1999@gmail.com
- **General Contact**: piyushsenjaliya1999@gmail.com
- **PGP Key**: Available on request

---

*Last updated: 2024-01-15*