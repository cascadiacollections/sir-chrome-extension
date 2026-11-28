/** Kept in lockstep with manifest.json and package.json. Tests assert that. */
export const APP_VERSION = '2.0.0';

/**
 * Radio Browser asks every client for a speaking User-Agent so the operator
 * can tell apps apart and rate-limit them separately. The repository URL is the source location after the rename to
 * cascadiacollections/shoutkit-browser-extension.
 */
export const USER_AGENT = `ShoutKit-Extension/${APP_VERSION} (+https://github.com/cascadiacollections/shoutkit-browser-extension)`;
