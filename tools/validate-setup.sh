#!/bin/bash
# Setup validation script for S.I.R Chrome Extension

set -e

echo "🔍 S.I.R Chrome Extension - Setup Validation"
echo "=============================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
  if [ "$NODE_VERSION" -ge 24 ]; then
    echo "  ✅ Node.js $(node --version) (>= 24.0.0 required)"
  else
    echo "  ⚠️  Node.js $(node --version) - Version 24.0.0 recommended (20+ supported)"
  fi
else
  echo "  ❌ Node.js $(node --version) - Version 20.0.0 or higher required"
  exit 1
fi

# Check npm version
echo "✓ Checking npm version..."
NPM_VERSION=$(npm --version | cut -d'.' -f1)
if [ "$NPM_VERSION" -ge 10 ]; then
  echo "  ✅ npm $(npm --version) (>= 10.0.0 required)"
else
  echo "  ❌ npm $(npm --version) - Version 10.0.0 or higher required"
  exit 1
fi

# Check if node_modules exists
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
  echo "  ✅ Dependencies installed"
else
  echo "  ⚠️  Dependencies not installed - running npm install..."
  npm install
fi

# Run type check
echo "✓ Running type check..."
if npm run type-check > /dev/null 2>&1; then
  echo "  ✅ Type check passed"
else
  echo "  ❌ Type check failed"
  exit 1
fi

# Run linting
echo "✓ Running linter..."
if npm run lint > /dev/null 2>&1; then
  echo "  ✅ Linting passed"
else
  echo "  ❌ Linting failed"
  exit 1
fi

# Run tests
echo "✓ Running tests..."
if npm test > /dev/null 2>&1; then
  echo "  ✅ Tests passed"
else
  echo "  ❌ Tests failed"
  exit 1
fi

# Run build
echo "✓ Building extension..."
if npm run build > /dev/null 2>&1; then
  echo "  ✅ Build successful"
else
  echo "  ❌ Build failed"
  exit 1
fi

# Check if build output exists
echo "✓ Verifying build output..."
if [ -f "app/dist/background.js" ]; then
  echo "  ✅ Build artifacts present"
else
  echo "  ❌ Build artifacts missing"
  exit 1
fi

echo ""
echo "=============================================="
echo "🎉 Setup validation complete!"
echo ""
echo "Next steps:"
echo "  1. Open Chrome and go to chrome://extensions/"
echo "  2. Enable 'Developer mode'"
echo "  3. Click 'Load unpacked' and select the 'app' folder"
echo "  4. Start developing with: npm run build:watch"
echo ""
echo "📖 See ONBOARDING.md for detailed instructions"
echo "=============================================="
