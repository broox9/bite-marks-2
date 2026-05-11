import { env as publicEnv } from "$env/dynamic/public";
import type { RequestEvent } from "@sveltejs/kit";

/** Canonical public origin for OAuth redirect URLs (falls back to request URL when unset). */
export function getAppBaseUrl(event: Pick<RequestEvent, "url">): string {
  const fromEnv = publicEnv.PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return event.url.origin;
}
