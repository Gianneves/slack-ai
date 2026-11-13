import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeRedirectPath } from "@/app/utils/redirect-path";
import { ENV } from "@/config/env";

const PATHNAME_HEADER = "x-pathname";

export function proxy(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  const pathname = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  requestHeaders.set(PATHNAME_HEADER, pathname);

  if (!request.cookies.has(ENV.SESSION_COOKIE_NAME)) {
    const url = request.nextUrl.clone();

    url.pathname = "/entrar";
    url.search = "";
    url.searchParams.set("para", safeRedirectPath(pathname));

    return NextResponse.redirect(url);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Cache-Control", "no-store");

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|entrar(?:$|/)|.*\\..*).*)",
  ],
};
