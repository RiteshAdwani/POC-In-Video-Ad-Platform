/**
 * @description Formats a 0-1 ratio as a one-decimal percentage, e.g. 0.6503 -> "65.0%".
 */
export const formatPercent = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;
