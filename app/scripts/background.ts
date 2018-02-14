class SIR {
  private static readonly STREAM_URL = 'http://64.150.176.42:8242/;stream.mp3';
  private static readonly PLAYER_INSTANCE = new Audio();
  private static readonly LABEL_OFF = 'OFF';
  private static readonly LABEL_ON = 'ON';

  /**
   * Constructor.
   */
  constructor() {
    SIR.PLAYER_INSTANCE.src = SIR.STREAM_URL;
    chrome.browserAction.setBadgeText(SIR.getBadge())
    chrome.browserAction.onClicked.addListener(SIR.handleBrowserAction)
  }

  /**
   * Toggle audio instance play / pause.
   */
  public static toggle(): void {
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
    SIR.toggle();
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
    let badge = { text: SIR.getBadgeText() };
    return badge;
  }

  /**
   * Stop audio playback.
   */
  private static stop(): void {
    SIR.PLAYER_INSTANCE.pause();
  }

  /**
   * Start audio playback.
   */
  private static play(): void {
    SIR.PLAYER_INSTANCE.src = SIR.STREAM_URL;
    SIR.PLAYER_INSTANCE.play();
  }
}

export default new SIR();