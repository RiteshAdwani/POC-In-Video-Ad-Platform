// Our own enforced timeout for Cloudinary Admin API calls (resource/destroy) - the SDK's own
// `timeout` option doesn't actually abort a hung request (see lib/cloudinary.ts), so this is
// what actually stops a status check or delete from waiting forever on a stuck connection.
export const STATUS_CHECK_TIMEOUT_MS = 15_000;
