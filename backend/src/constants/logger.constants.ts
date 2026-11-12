// Request fields the access log must never write out - credentials a log reader could reuse.
export const LOG_REDACT_PATHS = ['req.headers.authorization', 'req.headers.cookie'];

// Tests assert on responses and rows, not log lines - silent keeps their output readable.
export const LOG_LEVEL_BY_ENV = {
  development: 'debug',
  test: 'silent',
  production: 'info',
} as const;
