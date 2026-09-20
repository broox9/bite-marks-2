export const GOOGLE_MAPS_LOAD_TIMEOUT_MS = 20_000;

export type GoogleMapsLike = {
	maps?: {
		importLibrary?: (name: string) => Promise<unknown>;
	};
};

export type GoogleMapsLoaderHost = {
	google?: unknown;
	resolveGoogleLoaded?: () => Promise<GoogleMapsLike>;
	__googleMapsLoadFailed?: (reason?: unknown) => Promise<GoogleMapsLike>;
	__googleMapsLoaderInstalled?: boolean;
};

type TimerId = ReturnType<typeof setTimeout> | number;

type InstallOptions = {
	timeoutMs?: number;
	setTimer?: (handler: () => void, timeout: number) => TimerId;
	clearTimer?: (id: TimerId) => void;
};

function toError(reason: unknown): Error {
	if (reason instanceof Error) return reason;
	return new Error("Google Maps failed to load");
}

/**
 * Read `host.google` via property access so a missing Maps script never
 * throws `ReferenceError: Can't find variable: google` (Safari) /
 * `google is not defined` (Chromium).
 */
export function readGoogleMapsGlobal(
	host: GoogleMapsLoaderHost | null | undefined,
): GoogleMapsLike | undefined {
	if (!host) return undefined;
	const value = host.google;
	if (!value || typeof value !== "object") return undefined;
	return value as GoogleMapsLike;
}

/**
 * Shared waiter for the Maps JS bootstrap.
 *
 * `resolveGoogleLoaded` may be invoked by:
 * - our app code before the async Maps script finishes
 * - the Maps `callback=` once the script is actually ready
 *
 * Early callers receive the same pending promise instead of rejecting.
 */
export function installGoogleMapsLoader(
	host: GoogleMapsLoaderHost,
	options: InstallOptions = {},
): () => Promise<GoogleMapsLike> {
	if (host.__googleMapsLoaderInstalled && typeof host.resolveGoogleLoaded === "function") {
		return host.resolveGoogleLoaded;
	}

	const timeoutMs = options.timeoutMs ?? GOOGLE_MAPS_LOAD_TIMEOUT_MS;
	const setTimer = options.setTimer ?? setTimeout;
	const clearTimer = options.clearTimer ?? clearTimeout;

	let settled = false;
	let resolveReady!: (value: GoogleMapsLike) => void;
	let rejectReady!: (reason: Error) => void;
	const ready = new Promise<GoogleMapsLike>((resolve, reject) => {
		resolveReady = resolve;
		rejectReady = reject;
	});
	// The Maps script can fail (ad blocker / network) before any waiter attaches.
	ready.catch(() => {});

	let timeoutId: TimerId | undefined;

	const settleResolve = (value: GoogleMapsLike) => {
		if (settled) return;
		settled = true;
		if (timeoutId !== undefined) clearTimer(timeoutId);
		resolveReady(value);
	};

	const settleReject = (reason: unknown) => {
		if (settled) return;
		settled = true;
		if (timeoutId !== undefined) clearTimer(timeoutId);
		rejectReady(toError(reason));
	};

	const resolveGoogleLoaded = () => {
		const maps = readGoogleMapsGlobal(host);
		if (maps) settleResolve(maps);
		return ready;
	};

	host.resolveGoogleLoaded = resolveGoogleLoaded;
	host.__googleMapsLoadFailed = (reason?: unknown) => {
		settleReject(reason);
		return ready;
	};
	host.__googleMapsLoaderInstalled = true;

	timeoutId = setTimer(() => {
		const maps = readGoogleMapsGlobal(host);
		if (maps) {
			settleResolve(maps);
			return;
		}
		settleReject(new Error("Google Maps load timed out"));
	}, timeoutMs);

	resolveGoogleLoaded();
	return resolveGoogleLoaded;
}
