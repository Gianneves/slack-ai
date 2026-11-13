import { cookies } from "next/headers";
import { cache } from "react";
import { type Person, verifySession } from "@/app/services/sessions";
import { isSafeRedirectPath } from "@/app/utils/redirect-path";
import { ENV } from "@/config/env";

const CLEAR_SESSION_PATH = "/api/session/clear";

export type SessionState =
  | { status: "authenticated"; person: Person }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export const getSession = cache(async (): Promise<SessionState> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ENV.SESSION_COOKIE_NAME)?.value;

  return verifySession(token);
});

export function clearSessionUrl(pathname?: string | null): string {
  if (!isSafeRedirectPath(pathname)) {
    return CLEAR_SESSION_PATH;
  }

  return `${CLEAR_SESSION_PATH}?para=${encodeURIComponent(pathname)}`;
}
