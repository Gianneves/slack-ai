import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  appendRedirectParam,
  readRedirectParam,
} from "@/app/utils/redirect-path";
import { clearedSessionCookieOptions } from "@/app/utils/session-cookie";
import { ENV } from "@/config/env";

const ENTRAR_PATH = "/entrar";

export function GET(request: NextRequest): NextResponse {
  const location = appendRedirectParam(
    ENTRAR_PATH,
    readRedirectParam(request.nextUrl.searchParams),
  );
  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: location,
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
