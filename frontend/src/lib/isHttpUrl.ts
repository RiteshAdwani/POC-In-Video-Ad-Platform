import { CLICK_THROUGH_URL_PROTOCOLS } from '../constants/ad.constants';

/**
 * @description True only for a parseable http(s) link, so a javascript: or data: URL that got
 * stored anyway is never opened or rendered as a link.
 */
export const isHttpUrl = (url: string | null | undefined): url is string => {
  if (!url) return false;
  try {
    return CLICK_THROUGH_URL_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
};
