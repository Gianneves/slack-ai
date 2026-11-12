import { ENV } from "@/config/env";

const SESSIONS_PATH = "/v1/sessions";
const VERIFY_TIMEOUT_MS = 5000;

export interface Person {
  id: string;
  name: string;
  email: string;
}

export interface PersonSummary {
  id: string;
  email: string;
}

export type LoginResult =
  | { status: "authenticated"; token: string; person: PersonSummary }
  | { status: "invalid_credentials" }
  | { status: "too_many_attempts"; retryAfterSeconds: number }
  | { status: "validation_error" }
  | { status: "unavailable" };

export type VerifyResult =
  | { status: "authenticated"; person: Person }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export type LogoutResult =
  | { status: "done" }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

function sessionUrl(path: string): string {
  return new URL(`${SESSIONS_PATH}${path}`, ENV.CHAT_API_URL).toString();
}

function cookieHeader(token: string): Record<string, string> {
  return { Cookie: `${ENV.SESSION_COOKIE_NAME}=${token}` };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function readProblemCode(response: Response): Promise<string | null> {
  const body = await readJson(response);

  if (typeof body !== "object" || body === null) {
    return null;
  }

  const code = (body as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function readRetryAfterSeconds(response: Response): number {
  const value = Number(response.headers.get("retry-after"));

  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.ceil(value);
}

function isLoginResponse(
  body: unknown,
): body is { token: string; person: PersonSummary } {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const response = body as {
    token?: unknown;
    person?: { id?: unknown; email?: unknown };
  };

  return (
    typeof response.token === "string" &&
    typeof response.person === "object" &&
    response.person !== null &&
    typeof response.person.id === "string" &&
    typeof response.person.email === "string"
  );
}

function isCurrentSessionResponse(body: unknown): body is { person: Person } {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const response = body as {
    person?: { id?: unknown; name?: unknown; email?: unknown };
  };

  return (
    typeof response.person === "object" &&
    response.person !== null &&
    typeof response.person.id === "string" &&
    typeof response.person.name === "string" &&
    typeof response.person.email === "string"
  );
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  let response: Response;

  try {
    response = await fetch(sessionUrl(""), {
      method: "POST",
      headers: {
        Accept: "application/json, application/problem+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    return { status: "unavailable" };
  }

  if (response.status === 201) {
    const body = await readJson(response);
    return isLoginResponse(body)
      ? {
          status: "authenticated",
          token: body.token,
          person: body.person,
        }
      : { status: "unavailable" };
  }

  const code = await readProblemCode(response);

  if (code === "too_many_login_attempts" || response.status === 429) {
    return {
      status: "too_many_attempts",
      retryAfterSeconds: readRetryAfterSeconds(response),
    };
  }

  if (code === "validation_error" || response.status === 400) {
    return { status: "validation_error" };
  }

  if (code === "invalid_credentials" || response.status === 401) {
    return { status: "invalid_credentials" };
  }

  return { status: "unavailable" };
}

export async function verifySession(
  token: string | undefined,
): Promise<VerifyResult> {
  if (!token) {
    return { status: "unauthenticated" };
  }

  let response: Response;

  try {
    response = await fetch(sessionUrl("/current"), {
      headers: {
        Accept: "application/json, application/problem+json",
        ...cookieHeader(token),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
  } catch {
    return { status: "unavailable" };
  }

  if (response.status === 200) {
    const body = await readJson(response);
    return isCurrentSessionResponse(body)
      ? { status: "authenticated", person: body.person }
      : { status: "unavailable" };
  }

  return response.status === 401
    ? { status: "unauthenticated" }
    : { status: "unavailable" };
}

export async function logout(token: string | undefined): Promise<LogoutResult> {
  if (!token) {
    return { status: "done" };
  }

  let response: Response;

  try {
    response = await fetch(sessionUrl("/current"), {
      method: "DELETE",
      headers: {
        Accept: "application/json, application/problem+json",
        ...cookieHeader(token),
      },
      cache: "no-store",
    });
  } catch {
    return { status: "unavailable" };
  }

  if (response.status === 204) {
    return { status: "done" };
  }

  const code = await readProblemCode(response);

  if (code === "unauthenticated" || response.status === 401) {
    return { status: "unauthenticated" };
  }

  return { status: "unavailable" };
}
