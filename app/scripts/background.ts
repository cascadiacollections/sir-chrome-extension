/// <reference types="chrome-types" />

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

class MediaPlayer {
  readonly #audio = new Audio();
  readonly #config: RadioConfig;
  #state: PlaybackState = {
    isPlaying: false,
    isLoading: false,
    hasError: false,
    retryCount: 0,
  };

  constructor(config: RadioConfig) {
    this.#config = config;
    this.#setupAudioEvents();
    this.#setupChromeEvents();
    this.#updateBadge();
    this.#updateTitle();
  }

  #setupAudioEvents(): void {
    this.#audio.addEventListener('loadstart', () => {
      this.#setState({ isLoading: true, hasError: false });
      this.#updateBadge();
    });

    this.#audio.addEventListener('canplay', () => {
      this.#setState({ isLoading: false });
      this.#updateBadge();
    });

    this.#audio.addEventListener('play', () => {
      this.#setState({ isPlaying: true, retryCount: 0 });
      this.#updateBadge();
      this.#updateTitle();
    });

    this.#audio.addEventListener('pause', () => {
      this.#setState({ isPlaying: false });
      this.#updateBadge();
      this.#updateTitle();
    });

    this.#audio.addEventListener('error', event => {
      // eslint-disable-next-line no-console
      console.error('Audio error:', event);
      this.#setState({ hasError: true, isLoading: false, isPlaying: false });
      this.#updateBadge();
      this.#handlePlaybackError();
    });

    this.#audio.addEventListener('ended', () => {
      // Stream shouldn't end normally, try to reconnect
      this.#handlePlaybackError();
    });
  }

  #setupChromeEvents(): void {
    chrome.action.onClicked.addListener(() => this.#toggle());

    // Handle extension installation/update
    chrome.runtime.onInstalled.addListener(details => {
      if (details.reason === 'install') {
        // eslint-disable-next-line no-console
        console.log('S.I.R Extension installed');
      } else if (details.reason === 'update') {
        // eslint-disable-next-line no-console
        console.log(
          'S.I.R Extension updated to version',
          chrome.runtime.getManifest()['version']
        );
      }
    });
  }

  #setState(updates: Partial<PlaybackState>): void {
    this.#state = { ...this.#state, ...updates };
  }

  #getBadgeText(): string {
    if (this.#state.isLoading) {
      return '...';
    }
    if (this.#state.hasError) {
      return 'ERR';
    }
    return this.#state.isPlaying ? 'ON' : 'OFF';
  }

  #getBadgeColor(): string {
    if (this.#state.hasError) {
      return '#FF0000';
    }
    if (this.#state.isLoading) {
      return '#FFA500';
    }
    return this.#state.isPlaying ? '#00FF00' : '#808080';
  }

  #updateBadge(): void {
    const text = this.#getBadgeText();
    const color = this.#getBadgeColor();

    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
  }

  #updateTitle(): void {
    const title = this.#state.isPlaying
      ? 'S.I.R - Playing'
      : 'S.I.R - Click to Play';
    chrome.action.setTitle({ title });
  }

  #toggle(): void {
    if (this.#state.isPlaying) {
      this.#stop();
    } else {
      this.#play().catch((error: Error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to start playback:', error);
      });
    }
  }

  #stop(): void {
    this.#audio.pause();
    this.#audio.src = '';
    this.#setState({ isPlaying: false, isLoading: false, hasError: false });
    this.#updateBadge();
    this.#updateTitle();
  }

  async #play(): Promise<void> {
    try {
      this.#setState({ isLoading: true, hasError: false });
      this.#updateBadge();

      this.#audio.src = this.#config.url;
      this.#audio.load();

      await this.#audio.play();
      // eslint-disable-next-line no-console
      console.log('S.I.R playback started successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('S.I.R playback failed:', error);
      this.#setState({ hasError: true, isLoading: false });
      this.#updateBadge();
      throw error;
    }
  }

  async #handlePlaybackError(): Promise<void> {
    if (this.#state.retryCount >= this.#config.maxRetries) {
      // eslint-disable-next-line no-console
      console.error('Max retries reached, giving up');
      this.#setState({ hasError: true });
      this.#updateBadge();
      return;
    }

    this.#setState({ retryCount: this.#state.retryCount + 1 });
    // eslint-disable-next-line no-console
    console.log(
      `Attempting to reconnect (${this.#state.retryCount}/${
        this.#config.maxRetries
      })`
    );

    await new Promise(resolve => {
      setTimeout(resolve, this.#config.retryDelay);
    });

    try {
      await this.#play();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Retry failed:', error);
      // Will trigger another retry if under max retries
      setTimeout(() => {
        this.#handlePlaybackError();
      }, this.#config.retryDelay);
    }
  }

  // Public methods for potential future API
  public getState(): Readonly<PlaybackState> {
    return { ...this.#state };
  }

  public isPlaying(): boolean {
    return this.#state.isPlaying;
  }
}

const RADIO_CONFIG: RadioConfig = {
  url: 'https://broadcast.shoutcheap.com/proxy/willradio/stream',
  maxRetries: 3,
  retryDelay: 2000,
};

// Initialize the media player
const mediaPlayer = new MediaPlayer(RADIO_CONFIG);

export default mediaPlayer;
