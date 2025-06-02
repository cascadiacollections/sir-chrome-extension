# GitHub Copilot Instructions for S.I.R Chrome Extension

## Project Overview
This is a Chrome extension for SModcast Internet Radio (S.I.R) that provides streaming audio functionality with a background service worker. The extension uses TypeScript, modern build tools, and follows Chrome Manifest V3 standards.

## Development Guidelines

### TypeScript Standards
- Use strict TypeScript configuration with explicit return types
- Prefer private class fields (`#field`) for encapsulation
- Use interfaces for type definitions (`RadioConfig`, `PlaybackState`)
- Avoid `any` type - use proper typing
- Use `const` over `let`, never use `var`

### Chrome Extension Best Practices
- Follow Manifest V3 patterns with service workers
- Use `chrome.action` API for extension badge and clicks
- Handle Chrome extension lifecycle events properly
- Implement proper error handling for Chrome API calls

### Code Organization
- Keep functions small and focused (single responsibility)
- Use descriptive variable and function names
- Group related functionality into classes
- Separate concerns (audio handling, UI updates, error handling)
- Use dependency injection patterns where appropriate

### Error Handling
- Implement retry logic for network failures
- Use proper error boundaries and graceful degradation
- Log errors with context for debugging
- Provide visual feedback for error states

### Audio Management
- Handle all audio events (loadstart, canplay, play, pause, error, ended)
- Implement proper cleanup for audio resources
- Use async/await for audio operations
- Handle browser autoplay policies

### State Management
- Use explicit state objects with clear interfaces
- Implement immutable state updates
- Keep state changes predictable and traceable
- Separate UI state from business logic

### Testing Approach
- Write unit tests for core functionality
- Mock Chrome APIs using sinon-chrome
- Test error conditions and edge cases
- Maintain good test coverage

### Code Quality
- Follow ESLint rules and fix warnings
- Use proper JSDoc comments for public methods
- Keep code DRY (Don't Repeat Yourself)
- Maintain consistent formatting

## Architecture Patterns

### MediaPlayer Class Structure
```typescript
class MediaPlayer {
  readonly #audio = new Audio();
  readonly #config: RadioConfig;
  #state: PlaybackState;
  
  constructor(config: RadioConfig) { }
  
  // Event setup methods
  #setupAudioEvents(): void { }
  #setupChromeEvents(): void { }
  
  // State management
  #setState(updates: Partial<PlaybackState>): void { }
  
  // UI updates
  #updateBadge(): void { }
  #updateTitle(): void { }
  
  // Core functionality
  #toggle(): void { }
  #play(): Promise<void> { }
  #stop(): void { }
  
  // Error handling
  #handlePlaybackError(): Promise<void> { }
  
  // Public API
  public getState(): Readonly<PlaybackState> { }
  public isPlaying(): boolean { }
}
```

### Configuration Interface
```typescript
interface RadioConfig {
  readonly url: string;
  readonly maxRetries: number;
  readonly retryDelay: number;
}

interface PlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  retryCount: number;
}
```

## Build and Development

### Scripts Usage
- `npm run build:dev` - Development build with source maps
- `npm run build:watch` - Watch mode for active development
- `npm run build` - Production build
- `npm run test` - Run test suite
- `npm run lint` - Check code quality
- `npm run type-check` - TypeScript validation

### File Structure
```
app/
├── manifest.json          # Extension manifest (Manifest V3)
├── dist/                  # Built files (auto-generated)
├── images/               # Extension icons
├── scripts/
│   └── background.ts     # Main service worker
└── _locales/             # Internationalization
test/                     # Test files
```

## Common Patterns

### Chrome API Usage
```typescript
// Badge updates with proper typing
chrome.action.setBadgeText({ text: 'ON' });
chrome.action.setBadgeBackgroundColor({ color: '#00FF00' });
chrome.action.setTitle({ title: 'S.I.R - Playing' });

// Event listeners
chrome.action.onClicked.addListener(() => this.#toggle());
chrome.runtime.onInstalled.addListener((details) => { });
```

### Audio Event Handling
```typescript
this.#audio.addEventListener('play', () => {
  this.#setState({ isPlaying: true, retryCount: 0 });
  this.#updateBadge();
  this.#updateTitle();
});
```

### Error Handling with Retry
```typescript
async #handlePlaybackError(): Promise<void> {
  if (this.#state.retryCount >= this.#config.maxRetries) {
    this.#setState({ hasError: true });
    return;
  }
  
  this.#setState({ retryCount: this.#state.retryCount + 1 });
  await new Promise(resolve => setTimeout(resolve, this.#config.retryDelay));
  
  try {
    await this.#play();
  } catch (error) {
    setTimeout(() => this.#handlePlaybackError(), this.#config.retryDelay);
  }
}
```

## Common Issues to Avoid

1. **Don't use arrow functions for event handlers** when you need proper `this` binding
2. **Don't mutate state directly** - always use `#setState()` method
3. **Don't forget to handle audio cleanup** when stopping playback
4. **Don't ignore Chrome extension lifecycle events**
5. **Don't use console.log in production** - use proper logging with eslint directives

## Extension-Specific Considerations

- **Service Worker Limitations**: Remember that service workers have limitations on long-running processes
- **Audio Permissions**: Handle cases where audio autoplay is blocked
- **Network Changes**: Implement proper reconnection logic for network interruptions
- **Extension Updates**: Handle state migration during extension updates
- **Memory Management**: Clean up event listeners and audio resources properly

## Testing Guidelines

- Mock Chrome APIs using sinon-chrome
- Test both success and failure scenarios
- Verify state changes and UI updates
- Test retry logic and error handling
- Use descriptive test names that explain the behavior being tested

This project follows modern web development practices with a focus on reliability, maintainability, and user experience.
