/**
 * @description A URL's host without "www.", e.g. "https://www.flygoa.in/deals" -> "flygoa.in".
 * Falls back to the raw string if it doesn't parse as a URL.
 */
export const formatUrlHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};
