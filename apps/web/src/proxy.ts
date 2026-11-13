import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  appendRedirectParam,
  PATHNAME_HEADER,
} from "@/app/utils/redirect-path";
import { ENV } from "@/config/env";

export function proxy(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  const pathname = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  requestHeaders.set(PATHNAME_HEADER, pathname);

  if (!request.cookies.has(ENV.SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(
      new URL(appendRedirectParam("/entrar", pathname), request.url),
    );
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
