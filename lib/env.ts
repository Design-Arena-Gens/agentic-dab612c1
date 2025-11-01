import { z } from "zod";

const envSchema = z.object({
  NOTION_API_KEY: z.string().optional(),
  NOTION_DATABASE_ID: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().optional(),
  GMAIL_USER_ID: z.string().optional(),
  OPENAI_API_KEY: z.string().optional()
});

export const env = envSchema.parse({
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID,
  GMAIL_USER_ID: process.env.GMAIL_USER_ID ?? process.env.GOOGLE_CALENDAR_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
});

export function ensureEnv<T extends keyof typeof env>(keys: T[]) {
  const missing = keys.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
