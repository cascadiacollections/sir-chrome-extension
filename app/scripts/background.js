/**
 * S.I.R - Kevin Smith's SModcast Internet Radio
 * Unofficial Chrome Extension
 * @author       Kevin Coughlin <kevintcoughlin@gmail.com>
 * @copyright    2014-2016 Kevin Coughlin
 * @license      {@link https://github.com/KevinTCoughlin/sir-chrome-extension/blob/master/LICENSE.md|MIT License}
 */
(function() {
    'use strict';

    /**
     * @namespace SIR
     */
    var SIR = SIR || {
        streamURL: "http://68.168.101.146:8518/;stream.nsv&type=mp3",
        badge: {
            text: 'OFF'
        },
        toggleStream: () => {
          if (!SIR.player) {
              SIR.init();
          }

          if (SIR.player.paused) {
              SIR.player.src = SIR.streamURL
              SIR.player.play();
              SIR.badge.text = "ON"
          } else {
              SIR.player.src = ''
              SIR.player.pause();
              SIR.badge.text = "OFF";
          }
        },
        init: () => {
          SIR.player = new Audio();
          SIR.player.autoplay = true;
          SIR.player.src = SIR.streamURL
        },
        handleBrowserAction: () => {
          SIR.toggleStream();
          chrome.browserAction.setBadgeText(SIR.badge);
        }
    };

    chrome.browserAction.setBadgeText(SIR.badge);
    chrome.browserAction.onClicked.addListener(SIR.handleBrowserAction);
})();
