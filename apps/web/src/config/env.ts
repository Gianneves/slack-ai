import { z } from "zod";

const envSchema = z.object({
  CHAT_API_URL: z.url(),
  SESSION_COOKIE_NAME: z.string().trim().min(1).default("session"),
  SESSION_COOKIE_DOMAIN: z.string().trim().default(""),
  SESSION_COOKIE_SECURE: z.stringbool(),
});

export const ENV = envSchema.parse(process.env);
