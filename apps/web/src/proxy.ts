import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeRedirectPath } from "@/app/utils/redirect-path";
import { ENV } from "@/config/env";

export function proxy(request: NextRequest): NextResponse {
  if (request.cookies.has(ENV.SESSION_COOKIE_NAME)) {
    return NextResponse.next();
  }

  const para = safeRedirectPath(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  const url = request.nextUrl.clone();

  url.pathname = "/entrar";
  url.search = "";
  url.searchParams.set("para", para);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|entrar(?:$|/)|.*\\..*).*)",
  ],
};
