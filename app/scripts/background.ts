const SMODCAST_RADIO_URL: string = 'https://64.150.176.42:8242/;stream.mp3';
const LABEL_OFF: string = 'OFF';
const LABEL_ON: string = 'ON';

/**
 * S.I.R - SModcast Internet Radio audio player
 */
class MediaPlayer {
  private readonly audioElement: HTMLAudioElement = new Audio();
  private readonly url: string;

  constructor(url: string) {
    this.url = url;

    chrome.browserAction.setBadgeText(this.badge);
    chrome.browserAction.onClicked.addListener(this.handleBrowserAction);
  }

  /**
   * @returns the badge label text depending on audio player state.
   */
  private get badgeText(): string {
    return this.audioElement.paused ? LABEL_OFF : LABEL_ON;
  }

  /**
   * @returns the badge object to render.
   */
  private get badge(): chrome.browserAction.BadgeTextDetails {
    return { text: this.badgeText };
  }

  /**
   * Sets the audio source to S.I.R's stream URL.
   */
  private set audioSource(streamUrl: string) {
    this.audioElement.src = streamUrl;
  }

  /**
   * Toggle audio instance play / pause.
   */
  public toggle(): void {
    if (this.audioElement.paused) {
      this.play();
    } else {
      this.stop();
    }
  }

  /**
   * Handle click on extension badge.
   */
  private handleBrowserAction(): void {
    this.toggle();
    chrome.browserAction.setBadgeText(this.badge);
  }

  /**
   * Stop audio playback.
   */
  private stop(): void {
    this.audioElement.pause();
    delete this.audioElement.src;
  }

  /**
   * Start audio playback.
   */
  private play(): void {
    this.audioSource = this.url;
    this.audioElement.play()
       // tslint:disable-next-line:no-console
       .then((): void => { console.log(`Resume playback`); })
       // tslint:disable-next-line:no-console
       .catch((error: Error): void => { console.error(error); });
  }
}

// tslint:disable-next-line:no-default-export export-name
export default new MediaPlayer(SMODCAST_RADIO_URL);
