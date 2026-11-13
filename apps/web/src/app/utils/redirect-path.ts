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
