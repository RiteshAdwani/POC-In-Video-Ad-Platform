import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

// One .env file for the whole repo, at the root - not one per workspace. Loaded by explicit path
// so it's found regardless of which directory the process was actually started from.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Validated once, at import time. If a required var is missing/malformed the process exits
 * immediately with a clear message instead of failing confusingly deep inside a request handler.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  // Comma-separated - split into a list so both a local dev origin and a deployed frontend
  // origin can be allowed at once. The `cors` package accepts an array for `origin` directly.
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
