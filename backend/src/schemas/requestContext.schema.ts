import { z } from 'zod';

// A caller's X-Request-Id is logged as clientRequestId only if it's a UUID - never raw input.
export const requestIdSchema = z.uuid();
