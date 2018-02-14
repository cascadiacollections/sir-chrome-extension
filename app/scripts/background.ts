class SIR {
  private static readonly STREAM_URL = 'http://64.150.176.42:8242/;stream.mp3';
  private static readonly PLAYER_INSTANCE = new Audio();
  private static readonly LABEL_OFF = 'OFF';
  private static readonly LABEL_ON = 'ON';

  /**
   * Constructor.
   */
  constructor() {

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
   * Sets the audio source to S.I.R's stream URL.
   */
  private static setSrc(): void {
    SIR.PLAYER_INSTANCE.src = SIR.STREAM_URL;
  }

  /**
   * Stop audio playback.
   */
  private static stop(): void {
    SIR.PLAYER_INSTANCE.pause();
    SIR.PLAYER_INSTANCE.src = '';
  }

  /**
   * Start audio playback.
   */
  private static play(): void {
    SIR.setSrc();
    SIR.PLAYER_INSTANCE.play();
  }
}

export default new SIR();