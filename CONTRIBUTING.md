# Contributing to S.I.R Chrome Extension

Thank you for your interest in contributing to the S.I.R Chrome Extension! This document provides
guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js >= 24.0.0
- npm >= 10.0.0
- Git

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sir-chrome-extension.git
   cd sir-chrome-extension
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Building the Extension

```bash
# Development build with source maps
npm run build:dev

# Production build
npm run build

# Watch mode for active development
npm run build:watch
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint the code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Type check without building
npm run type-check
```

### Loading the Extension in Chrome

1. Build the extension (`npm run build:dev`)
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `app` folder
5. The extension should now appear in your extensions list

## Code Style and Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer `const` over `let`, avoid `var`
- Use private class fields (`#field`) for encapsulation
- Include return types for all functions
- Use interfaces for object shapes
- Avoid `any` type - use proper typing

### Code Organization

- Keep functions small and focused
- Use descriptive variable and function names
- Group related functionality into classes
- Separate concerns (audio handling, UI updates, error handling)

### Comments and Documentation

- Use JSDoc comments for public methods
- Explain complex logic with inline comments
- Keep comments up to date with code changes

## Project Structure

```
app/
├── manifest.json          # Chrome extension manifest
├── dist/                  # Built JavaScript files (auto-generated)
├── images/               # Extension icons and assets
├── scripts/
│   └── background.ts     # Main background service worker
└── _locales/
    └── en/
        └── messages.json # Internationalization strings

test/                     # Test files
webpack.config.js        # Build configuration
tsconfig.json           # TypeScript configuration
eslint.config.mjs       # ESLint configuration
```

## Submitting Changes

### Before Submitting

1. Ensure all tests pass: `npm run test`
2. Ensure code passes linting: `npm run lint`
3. Test the extension manually in Chrome
4. Update documentation if needed
5. Add tests for new functionality

### Pull Request Process

1. Update the README.md if your changes affect usage
2. Update the version number in both `package.json` and `app/manifest.json` if appropriate
3. Create a pull request with a clear title and description
4. Include:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots/recordings if UI changes were made

### Commit Messages

Use clear, descriptive commit messages:

- `feat: add retry logic for failed stream connections`
- `fix: resolve badge color not updating on error`
- `docs: update installation instructions`
- `test: add unit tests for MediaPlayer class`

## Feature Requests and Bug Reports

### Bug Reports

When reporting bugs, please include:

- Chrome version
- Extension version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Console errors (if any)
- Screenshots (if applicable)

### Feature Requests

For new features, please:

- Explain the use case
- Describe the proposed solution
- Consider the impact on existing functionality
- Discuss alternatives you've considered

## Testing Guidelines

### Unit Tests

- Write tests for all new functionality
- Use descriptive test names
- Test both success and failure cases
- Mock external dependencies (Chrome APIs, Audio)

### Manual Testing

Before submitting changes, test:

1. Extension installation/loading
2. Play/pause functionality
3. Error handling (disconnect network, invalid stream)
4. Badge updates and colors
5. Extension icon tooltip updates

## Questions and Support

If you have questions about contributing:

1. Check existing issues and discussions
2. Create a new issue with the "question" label
3. Be specific about what you're trying to achieve

## Code of Conduct

- Be respectful and constructive in discussions
- Focus on the code and technical issues
- Help others learn and contribute
- Follow the project's coding standards

Thank you for contributing to the S.I.R Chrome Extension!
