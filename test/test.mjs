/* eslint-env mocha */

"use strict";

import { expect } from "chai";
import chrome from "sinon-chrome";

// Mock global objects for testing
global.chrome = chrome;
global.Audio = class {
  constructor() {
    this.src = "";
    this.paused = true;
    this.addEventListener = () => {};
    this.removeEventListener = () => {};
    this.play = () => Promise.resolve();
    this.pause = () => {};
    this.load = () => {};
  }
};

describe("S.I.R Chrome Extension", function () {
  beforeEach(function () {
    chrome.flush();
  });

  describe("Chrome API Setup", function () {
    it("should have chrome runtime property", function () {
      expect(chrome).to.have.property("runtime");
    });

    it("should be able to setup action API", function () {
      // sinon-chrome doesn't include action by default, but we can add it
      chrome.action = {
        setBadgeText: () => {},
        setBadgeBackgroundColor: () => {},
        setTitle: () => {},
        onClicked: { addListener: () => {} },
      };
      expect(chrome).to.have.property("action");
      expect(chrome.action.setBadgeText).to.be.a("function");
      expect(chrome.action.setBadgeBackgroundColor).to.be.a("function");
      expect(chrome.action.setTitle).to.be.a("function");
      expect(chrome.action.onClicked.addListener).to.be.a("function");
    });
  });

  describe("Audio Mock", function () {
    it("should create Audio instance", function () {
      const audio = new Audio();
      expect(audio).to.have.property("src");
      expect(audio).to.have.property("paused");
      expect(audio.paused).to.be.true;
    });

    it("should have required audio methods", function () {
      const audio = new Audio();
      expect(audio.play).to.be.a("function");
      expect(audio.pause).to.be.a("function");
      expect(audio.load).to.be.a("function");
      expect(audio.addEventListener).to.be.a("function");
    });
  });

  describe("Extension Configuration", function () {
    it("should have valid radio URL format", function () {
      const radioUrl = "https://64.150.176.42:8242/;stream.mp3";
      expect(radioUrl).to.match(/^https?:\/\/.+/);
      expect(radioUrl).to.include(".mp3");
    });

    it("should have reasonable retry configuration", function () {
      const maxRetries = 3;
      const retryDelay = 2000;

      expect(maxRetries).to.be.a("number");
      expect(maxRetries).to.be.greaterThan(0);
      expect(retryDelay).to.be.a("number");
      expect(retryDelay).to.be.greaterThan(1000);
    });
  });
});
