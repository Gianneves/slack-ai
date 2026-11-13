import { ENV } from "@/config/env";

const SESSION_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: ENV.SESSION_COOKIE_SECURE,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    ...(ENV.SESSION_COOKIE_DOMAIN ? { domain: ENV.SESSION_COOKIE_DOMAIN } : {}),
  };
}

export function clearedSessionCookieOptions() {
  return { ...sessionCookieOptions(), maxAge: 0 };
}
