import { SESSION_KEY_PREFIX } from '../constants/playback.constants';

/**
 * @description One session id per video per tab, reused across a reload. Keyed by video so
 * watching a second video in the same tab doesn't inherit the first one's session.
 */
export const getOrCreateSessionId = (videoId: string): string => {
  const key = `${SESSION_KEY_PREFIX}${videoId}`;
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;

  const id = crypto.randomUUID();
  sessionStorage.setItem(key, id);
  return id;
};
