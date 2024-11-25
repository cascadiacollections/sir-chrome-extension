const RADIO_URL = 'https://64.150.176.42:8242/;stream.mp3';

class MediaPlayer {
  private audio = new Audio();

  constructor(private url: string) {
    chrome.browserAction.setBadgeText({ text: this.getBadgeText() });
    chrome.browserAction.onClicked.addListener(() => this.toggle());
  }

  private getBadgeText(): string {
    return this.audio.paused ? 'OFF' : 'ON';
  }

  private updateBadge(): void {
    chrome.browserAction.setBadgeText({ text: this.getBadgeText() });
  }

  toggle(): void {
    this.audio.paused ? this.play() : this.stop();
    this.updateBadge();
  }

  private stop(): void {
    this.audio.pause();
    this.audio.src = '';
  }

  private play(): void {
    this.audio.src = this.url;
    this.audio
      .play()
      .then(() => console.log('Playback started'))
      .catch(console.error);
  }
}

export default new MediaPlayer(RADIO_URL);