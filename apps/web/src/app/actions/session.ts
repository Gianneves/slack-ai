"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { login, logout } from "@/app/services/sessions";
import { safeRedirectPath } from "@/app/utils/redirect-path";
import { ENV } from "@/config/env";

const SESSION_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

export type EntrarResult =
  | { status: "invalid_credentials" }
  | { status: "too_many_attempts"; retryAfterSeconds: number }
  | { status: "validation_error" }
  | { status: "unavailable" };

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: ENV.SESSION_COOKIE_SECURE,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    ...(ENV.SESSION_COOKIE_DOMAIN ? { domain: ENV.SESSION_COOKIE_DOMAIN } : {}),
  };
}

export async function entrar(
  _previous: EntrarResult | null,
  formData: FormData,
): Promise<EntrarResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const paraValue = formData.get("para");
  const para = safeRedirectPath(
    typeof paraValue === "string" ? paraValue : null,
  );
  const result = await login({ email, password });

  if (result.status !== "authenticated") {
    return result;
  }

  const cookieStore = await cookies();
  cookieStore.set(ENV.SESSION_COOKIE_NAME, result.token, sessionCookieOptions());
  redirect(para);
}

export async function sair(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ENV.SESSION_COOKIE_NAME)?.value;

  await logout(token);

  cookieStore.set(ENV.SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  redirect("/entrar");
}
