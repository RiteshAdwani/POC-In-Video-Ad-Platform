import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * @description Formats an ISO date string as "2 days ago" - used on video/ad cards, where roughly
 * how recent something is matters more than the exact date.
 */
export const formatRelativeTime = (isoDate: string) => dayjs(isoDate).fromNow();
