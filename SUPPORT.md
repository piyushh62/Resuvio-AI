# Support

Thank you for using Resuvio-AI! Here are the ways to get help and support.

## 📚 Documentation

Before asking for help, please check our documentation:

- **[Getting Started](docs/getting-started.md)** - Installation and setup guide
- **[Architecture](docs/architecture.md)** - System design and data flow
- **[API Reference](docs/api.md)** - Complete API documentation
- **[Deployment](docs/deployment.md)** - Production deployment guide
- **[Contributing](CONTRIBUTING.md)** - Development guidelines

## 💬 Community Support

### GitHub Discussions (Recommended)
Best for: Questions, ideas, feature requests, general discussion
- [GitHub Discussions](https://github.com/piyushh62/Resuvio-AI/discussions)
- Search existing discussions before creating new ones
- Tag appropriately: `question`, `idea`, `help-wanted`, `show-and-tell`

### GitHub Issues
Best for: Bug reports, specific feature requests, documentation issues
- [Create an Issue](https://github.com/piyushh62/Resuvio-AI/issues/new/choose)
- Use the appropriate issue template
- Provide all requested information

### Discord Community
Best for: Real-time chat, quick questions, community interaction
- [Join our Discord](https://discord.gg/resuvio-ai) *(link placeholder)*
- Channels: #general, #help, #showcase, #announcements

## 🐛 Bug Reports

Found a bug? Please report it!

1. **Search existing issues** first to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. **Include**:
   - Clear steps to reproduce
   - Expected vs actual behavior
   - Screenshots/screen recordings
   - Environment details (OS, browser, Node version)
   - Error messages and stack traces

## 💡 Feature Requests

Have an idea for a new feature?

1. **Check the roadmap** in GitHub Projects
2. **Search existing feature requests**
3. **Use the feature request template**
4. **Explain the problem** you're trying to solve
5. **Describe your proposed solution**

## 📧 Direct Contact

### General Inquiries
- **Email**: piyushsenjaliya1999@gmail.com
- **Response time**: 2-3 business days

### Security Issues
- **Email**: piyushsenjaliya1999@gmail.com
- **DO NOT** use public channels for security vulnerabilities
- See [SECURITY.md](SECURITY.md) for details

### Business/Partnership
- **Email**: piyushsenjaliya1999@gmail.com

### Press/Media
- **Email**: piyushsenjaliya1999@gmail.com

## 🆘 Troubleshooting Common Issues

### Frontend Won't Start
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend Connection Errors
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Verify environment variables
cat backend/.env

# Check Firebase credentials
# Ensure GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON is set
```

### Firebase Emulator Issues
```bash
# Reset emulators
firebase emulators:start --project=demo-resuvio --import=./emulator-data --export-on-exit

# Clear emulator data
firebase emulators:start --project=demo-resuvio --import=./emulator-data --export-on-exit=./emulator-data
```

### Build Failures
```bash
# TypeScript errors
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit

# Linting errors
cd frontend && npm run lint
cd backend && npm run lint
```

## 📋 FAQ

### General
**Q: Is Resuvio-AI free to use?**
A: Yes, there's a free tier with limited credits. See [pricing](https://resuvio-ai.vercel.app/pricing).

**Q: Can I self-host Resuvio-AI?**
A: Yes! See [deployment guide](docs/deployment.md) for Docker and manual deployment options.

**Q: What AI model does Resuvio-AI use?**
A: Google's Gemini 2.5 Flash by default, configurable via `GEMINI_MODEL` env var.

### Technical
**Q: How do I update my Firebase configuration?**
A: Update the environment variables in `.env` files. See [getting started](docs/getting-started.md).

**Q: Can I use a different database?**
A: Currently only Firestore is supported. PRs welcome for other databases!

**Q: How do I add a new API endpoint?**
A: Follow the pattern in `backend/src/routes/` and `backend/src/controllers/`. See [architecture](docs/architecture.md).

### Account & Billing
**Q: How do I cancel my subscription?**
A: Go to Dashboard → Billing → Cancel Subscription

**Q: Can I get a refund?**
A: See our [Refund Policy](https://resuvio-ai.vercel.app/refund-policy)

**Q: How do credits work?**
A: Each AI operation consumes credits. Free tier: 10 credits/month. Pro: 500 credits/month.

## 🤝 Contributing

Want to help improve Resuvio-AI? See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Coding standards
- Pull request process
- Testing guidelines

## 📄 License

Resuvio-AI is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Firebase](https://firebase.google.com/) for backend services
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- All our contributors!

---

**Still need help?** Don't hesitate to reach out through any of the channels above. We're here to help! 🚀