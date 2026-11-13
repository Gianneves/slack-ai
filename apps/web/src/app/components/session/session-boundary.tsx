import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { clearSessionUrl, getSession } from "@/app/queries/session";
import {
  PATHNAME_HEADER,
  safeRedirectPath,
} from "@/app/utils/redirect-path";
import { SessionError } from "./session-error";

export async function SessionBoundary({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (session.status === "unauthenticated") {
    const requestHeaders = await headers();

    redirect(clearSessionUrl(requestHeaders.get(PATHNAME_HEADER)));
  }

  if (session.status === "unavailable") {
    const requestHeaders = await headers();
    const retryHref = safeRedirectPath(requestHeaders.get(PATHNAME_HEADER));

    return <SessionError retryHref={retryHref} />;
  }

  return <>{children}</>;
}
