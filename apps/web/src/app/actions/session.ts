"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { login, logout } from "@/app/services/sessions";
import { safeRedirectPath } from "@/app/utils/redirect-path";
import {
  clearedSessionCookieOptions,
  sessionCookieOptions,
} from "@/app/utils/session-cookie";
import { ENV } from "@/config/env";

export type EntrarResult =
  | { status: "invalid_credentials" }
  | { status: "too_many_attempts"; retryAfterSeconds: number }
  | { status: "validation_error" }
  | { status: "unavailable" };

export async function entrar(
  _previous: EntrarResult | null,
  formData: FormData,
): Promise<EntrarResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectValue = formData.get("para");
  const redirectTo = safeRedirectPath(
    typeof redirectValue === "string" ? redirectValue : null,
  );
  const result = await login({ email, password });

  if (result.status !== "authenticated") {
    return result;
  }

  const cookieStore = await cookies();
  cookieStore.set(ENV.SESSION_COOKIE_NAME, result.token, sessionCookieOptions());
  redirect(redirectTo);
}

export async function sair(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ENV.SESSION_COOKIE_NAME)?.value;

  await logout(token);

  cookieStore.set(ENV.SESSION_COOKIE_NAME, "", clearedSessionCookieOptions());
  redirect("/entrar");
}
