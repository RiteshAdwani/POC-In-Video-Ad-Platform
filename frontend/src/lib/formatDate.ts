/**
 * @description Formats an ISO date string as e.g. "5 Jan 2026" - the shared display format for
 * any created/updated timestamp shown in a card or table across the app.
 */
export const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
