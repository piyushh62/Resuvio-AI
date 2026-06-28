---
name: Pull Request Template
about: Standard PR template for Resuvio-AI
title: '[TYPE] Brief description'
labels: ['needs-review']
assignees: ['piyushh62']
---

## 📋 Description
**What does this PR do?**
A clear and concise description of the changes.

**Related Issue:** Closes #(issue number)

## 🔄 Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not to not work)
- [ ] 📝 Documentation update
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test addition/update
- [ ] 🔧 Chore (build, deps, config)

## 🧪 Testing
**How has this been tested?**
- [ ] Unit tests pass (`npm test`)
- [ ] Integration tests pass
- [ ] Manual testing done
- [ ] E2E tests pass

**Test Configuration:**
- Frontend: `cd frontend && npm run test`
- Backend: `cd backend && npm run test`

## 📸 Screenshots (if UI changes)
| Before | After |
|--------|-------|
| ![before](url) | ![after](url) |

## ✅ Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings/errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## 🔗 Deployment Notes
- [ ] No deployment changes needed
- [ ] Requires environment variable changes (list in description)
- [ ] Requires database migration (link migration file)
- [ ] Requires manual steps post-deploy (describe)

## 📝 Additional Notes
Any additional information, configuration, or data that might be necessary to reproduce or understand the changes.