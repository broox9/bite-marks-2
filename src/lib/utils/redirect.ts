const DEFAULT_REDIRECT = "/list";

/**
 * Only allow same-origin application paths. This prevents `redirectTo` from
 * becoming an open redirect after authentication.
 */
export function safeRedirectTo(value: string | null | undefined, fallback = DEFAULT_REDIRECT) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const parsed = new URL(value, "https://bite-marks.local");
    if (parsed.origin !== "https://bite-marks.local") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
