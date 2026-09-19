/**
 * @description Formats a whole number of seconds as "m:ss", e.g. 65 -> "1:05" - used for ad
 * placement offsets and durations.
 */
export const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
