import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/components/auth/login-form";
import { SessionError } from "@/app/components/session/session-error";
import { clearSessionUrl, getSession } from "@/app/queries/session";
import {
  appendRedirectParam,
  isSafeRedirectPath,
} from "@/app/utils/redirect-path";
import { ENV } from "@/config/env";

export const instant = false;

const LOGIN_PATH = "/entrar";

export default async function EntrarPage({
  searchParams,
}: PageProps<"/entrar">) {
  const params = await searchParams;
  const requested = params.para;
  const para =
    typeof requested === "string" && isSafeRedirectPath(requested)
      ? requested
      : null;

  const cookieStore = await cookies();

  if (cookieStore.has(ENV.SESSION_COOKIE_NAME)) {
    const session = await getSession();

    if (session.status === "authenticated") {
      redirect("/");
    }

    if (session.status === "unauthenticated") {
      redirect(clearSessionUrl());
    }

    const retryHref = appendRedirectParam(LOGIN_PATH, para);

    return <SessionError retryHref={retryHref} />;
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-surface-subtle p-6">
      <section className="flex w-full max-w-sm flex-col gap-6 rounded-panel bg-surface-raised p-10 shadow-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-display font-black text-fg">
            Entrar no Full Cycle Chat
          </h1>
          <p className="text-body text-fg-muted">
            Use o e-mail e a senha da conta criada pela empresa.
          </p>
        </div>
        <LoginForm para={para} />
      </section>
    </main>
  );
}
