/**
 * S.I.R - SModcast Internet Radio audio player
 */
// tslint:disable-next-line:no-unnecessary-class
class SIR {
  private static readonly STREAM_URL: string = 'https://64.150.176.42:8242/;stream.mp3';
  private static readonly PLAYER_INSTANCE: HTMLAudioElement = new Audio();
  private static readonly LABEL_OFF: string = 'OFF';
  private static readonly LABEL_ON: string = 'ON';

  /**
   * Constructor.
   */
  constructor() {
    chrome.browserAction.setBadgeText(SIR.getBadge());
    chrome.browserAction.onClicked.addListener(SIR.handleBrowserAction);
  }

  /**
   * Toggle audio instance play / pause.
   */
  public static TOGGLE(): void {
    if (SIR.PLAYER_INSTANCE.paused) {
      SIR.play();
    } else {
      SIR.stop();
    }
  }

  /**
   * Handle click on extension badge.
   */
  private static handleBrowserAction(): void {
    SIR.TOGGLE();
    chrome.browserAction.setBadgeText(SIR.getBadge());
  }

  /**
   * @returns the badge label text depending on audio player state.
   */
  private static getBadgeText(): string {
    return SIR.PLAYER_INSTANCE.paused ? SIR.LABEL_OFF : SIR.LABEL_ON;
  }

  /**
   * @returns the badge object to render.
   */
  private static getBadge(): chrome.browserAction.BadgeTextDetails {
    return { text: SIR.getBadgeText() };
  }

  /**
   * Sets the audio source to S.I.R's stream URL.
   */
  private static setSrc(streamUrl: string): void {
    SIR.PLAYER_INSTANCE.src = streamUrl;
  }

  /**
   * Stop audio playback.
   */
  private static stop(): void {
    SIR.PLAYER_INSTANCE.pause();
    delete SIR.PLAYER_INSTANCE.src;
  }

  /**
   * Start audio playback.
   */
  private static play(): void {
    SIR.setSrc(SIR.STREAM_URL);
    SIR.PLAYER_INSTANCE.play()
       // tslint:disable-next-line:no-console
       .then((): void => { console.log(`Resume playback`); })
       // tslint:disable-next-line:no-console
       .catch((error: Error): void => { console.error(error); });
  }
}

// tslint:disable-next-line:no-default-export export-name
export default new SIR();
