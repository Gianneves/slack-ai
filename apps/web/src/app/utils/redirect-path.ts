const REDIRECT_PARAM = "para";

export const PATHNAME_HEADER = "x-pathname";

export function isSafeRedirectPath(
  value: string | null | undefined,
): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  );
}

export function safeRedirectPath(value: string | null | undefined): string {
  return isSafeRedirectPath(value) ? value : "/";
}

export function appendRedirectParam(
  path: string,
  value: string | null | undefined,
): string {
  return isSafeRedirectPath(value)
    ? `${path}?${REDIRECT_PARAM}=${encodeURIComponent(value)}`
    : path;
}

export function readRedirectParam(searchParams: URLSearchParams): string | null {
  return searchParams.get(REDIRECT_PARAM);
}
