const RADIO_URL = 'https://64.150.176.42:8242/;stream.mp3';

class MediaPlayer {
  #audio = new Audio(); // Private class field for encapsulation

  constructor(private url: string) {
    this.#updateBadge();
    chrome.action.onClicked.addListener(() => this.#toggle());
  }

  #getBadgeText = () => (this.#audio.paused ? 'OFF' : 'ON'); // Arrow function for concise logic

  #updateBadge = () =>
    chrome.action.setBadgeText({ text: this.#getBadgeText() }); // Inline badge update for Manifest V3

  #toggle = () => {
    this.#audio.paused ? this.#play() : this.#stop();
    this.#updateBadge();
  };

  #stop = () => {
    this.#audio.pause();
    this.#audio.src = '';
  };

  #play = async () => {
    this.#audio.src = this.url;
    try {
      await this.#audio.play();
      console.log('Playback started'); // Improved logging
    } catch (error) {
      console.error('Playback failed:', error); // Improved error handling
    }
  };
}

export default new MediaPlayer(RADIO_URL);