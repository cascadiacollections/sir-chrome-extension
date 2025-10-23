# Dev Container

This project uses [Dev Containers](https://containers.dev/) to provide a consistent development
environment.

## Features

- **Node.js 24**: Latest LTS version
- **Git**: Pre-installed and configured
- **GitHub CLI**: For GitHub integration
- **VS Code Extensions**: Pre-configured with TypeScript, ESLint, Prettier support
- **GitHub Copilot**: AI-powered coding assistance included
- **Automatic Setup**: Dependencies install and initial build on container creation
- **Type Checking**: Runs on container start to ensure everything is working

## Getting Started

1. Open this repository in VS Code
2. Install the "Dev Containers" extension if you haven't already
3. When prompted, click "Reopen in Container"
4. Wait for the container to build and dependencies to install

## Manual Setup

If the automatic setup doesn't work:

1. Open the Command Palette (Ctrl/Cmd + Shift + P)
2. Run "Dev Containers: Reopen in Container"

The container will automatically run `npm install && npm run build:dev` after creation and `npm run type-check` on each start to ensure your environment is healthy.

## Benefits

Using the dev container provides:

- **Zero Configuration**: All tools and extensions pre-installed
- **Consistency**: Same environment for all developers
- **Isolation**: No conflicts with your local Node.js setup
- **Speed**: Get coding in minutes, not hours
- **Best Practices**: GitHub Copilot and recommended extensions included

Perfect for contributors and maintainers alike!
