export function formatSavedLocationsBackendError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (/Could not find public function for 'savedLocations:/i.test(raw)) {
    return "Convex savedLocations functions are not deployed on the active backend (run `npx convex deploy`).";
  }
  const cleaned = raw
    .replace(/^\[Request ID: [^\]]+\]\s*/i, "")
    .replace(/^Server Error\s*/i, "")
    .replace(/^Uncaught Error:\s*/i, "")
    .split("\n")[0]
    ?.trim();
  return cleaned || "Saved locations service error on the active Convex backend.";
}
