import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isSafeRedirectPath } from "@/app/utils/redirect-path";
import { clearedSessionCookieOptions } from "@/app/utils/session-cookie";
import { ENV } from "@/config/env";

const ENTRAR_PATH = "/entrar";

export function GET(request: NextRequest): NextResponse {
  const para = request.nextUrl.searchParams.get("para");
  const search = isSafeRedirectPath(para)
    ? `?para=${encodeURIComponent(para)}`
    : "";
  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: `${ENTRAR_PATH}${search}`,
      "Cache-Control": "no-store",
    },
  });

  response.cookies.set(
    ENV.SESSION_COOKIE_NAME,
    "",
    clearedSessionCookieOptions(),
  );

  return response;
}
