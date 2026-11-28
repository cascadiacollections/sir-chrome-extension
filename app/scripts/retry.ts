/**
 * Stream reconnects keep the old extension's shape: three retries after the
 * first failure, starting at 2s and doubling so a dead host is not hammered.
 * Directory failover matches ShoutKit's interactive policy (350ms, doubled).
 */
export const MAX_STREAM_RETRIES = 3;
export const STREAM_RETRY_BASE_MS = 2000;
export const DIRECTORY_MAX_ATTEMPTS = 3;
export const DIRECTORY_RETRY_BASE_MS = 350;

function cappedShift(attempt: number): number {
  if (!Number.isFinite(attempt) || attempt <= 0) {
    return 0;
  }
  return Math.min(Math.floor(attempt), 8);
}

export function streamRetryDelayMs(retryIndex: number): number {
  return STREAM_RETRY_BASE_MS * 2 ** cappedShift(retryIndex);
}

export function directoryRetryDelayMs(attempt: number): number {
  return DIRECTORY_RETRY_BASE_MS * 2 ** cappedShift(attempt);
}

/** `retryCount` is how many reconnects have already been scheduled. */
export function canRetryStream(retryCount: number): boolean {
  return retryCount < MAX_STREAM_RETRIES;
}
