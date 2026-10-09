// Request fields the access log must never write out - credentials a log reader could reuse.
export const LOG_REDACT_PATHS = ['req.headers.authorization', 'req.headers.cookie'];
