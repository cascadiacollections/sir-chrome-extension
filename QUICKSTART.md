# 🚀 Quick Start - Enlistment Cheat Sheet

## First Time Setup (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/cascadiacollections/sir-chrome-extension.git
cd sir-chrome-extension

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build

# 4. Run tests to verify setup
npm test

# Or run comprehensive validation
npm run validate-setup
```

## Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `app` folder

## Essential Commands

| Command | Description |
|---------|-------------|
| `npm run build:dev` | Development build with source maps |
| `npm run build:watch` | Watch mode for active development |
| `npm run build` | Production build |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run type-check` | TypeScript validation |
| `npm run pre-commit` | Run all checks before committing |
| `npm run validate-setup` | Comprehensive setup validation |

## Development Workflow

```bash
# Start watch mode
npm run build:watch

# In another terminal
npm run test:watch

# Make changes to app/scripts/background.ts
# Extension auto-recompiles
# Reload extension in Chrome to test
```

## File Structure

```
app/
├── manifest.json       # Extension config
├── scripts/
│   └── background.ts   # Main logic ⭐
├── images/            # Icons
└── dist/              # Built files (auto-generated)
```

## Need Help?

- 📖 **Detailed Guide**: [ONBOARDING.md](ONBOARDING.md)
- 💻 **Development Docs**: [DEVELOPMENT.md](DEVELOPMENT.md)
- 🤝 **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- ❓ **Issues**: [GitHub Issues](https://github.com/cascadiacollections/sir-chrome-extension/issues)

## Using Dev Container (Recommended)

1. Install Docker Desktop
2. Install VS Code Dev Containers extension
3. Open project in VS Code
4. Click "Reopen in Container"
5. ✅ Everything is pre-configured!

## Quick Debugging

| Method | How To |
|--------|--------|
| **VS Code** | Press `F5` → Chrome opens with extension |
| **Chrome DevTools** | Right-click extension icon → "Inspect popup" |
| **Background Script** | `chrome://extensions/` → S.I.R → "Inspect views" |

## Before Submitting PR

```bash
npm run pre-commit  # Runs format, lint, type-check, and test
```

## Branch Naming

- `feature/your-feature-name` - New features
- `fix/issue-description` - Bug fixes
- `docs/what-changed` - Documentation updates

## Commit Messages (Conventional Commits)

- `feat: Add new feature`
- `fix: Resolve issue with...`
- `docs: Update README`
- `test: Add tests for...`
- `chore: Update dependencies`

---

**Pro Tip**: Star the repo, watch for updates, and join the discussion! 🌟
