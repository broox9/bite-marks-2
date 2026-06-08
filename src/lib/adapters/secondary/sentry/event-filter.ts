const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

export type SentryEventWithRequest = {
  request?: {
    url?: string;
  };
};

export function isLocalHostname(hostname: string | null | undefined): boolean {
  if (!hostname) return false;

  const normalized = hostname.toLowerCase();
  return LOCAL_HOSTNAMES.has(normalized) || normalized.endsWith(".localhost");
}

export function isLocalUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    return isLocalHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function shouldDropLocalSentryEvent(event: SentryEventWithRequest): boolean {
  return isLocalUrl(event.request?.url);
}
