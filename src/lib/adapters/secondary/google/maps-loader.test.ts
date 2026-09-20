import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	GOOGLE_MAPS_LOAD_TIMEOUT_MS,
	installGoogleMapsLoader,
	readGoogleMapsGlobal,
	type GoogleMapsLike,
	type GoogleMapsLoaderHost,
} from "./maps-loader";

describe("readGoogleMapsGlobal", () => {
	it("returns undefined without throwing when google is missing", () => {
		expect(readGoogleMapsGlobal(undefined)).toBeUndefined();
		expect(readGoogleMapsGlobal(null)).toBeUndefined();
		expect(readGoogleMapsGlobal({})).toBeUndefined();
		expect(readGoogleMapsGlobal({ google: undefined })).toBeUndefined();
	});

	it("returns the Maps global when present", () => {
		const google = { maps: {} };
		expect(readGoogleMapsGlobal({ google })).toBe(google);
	});
});

describe("installGoogleMapsLoader", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("does not throw when called before the Maps script defines google", () => {
		const host: GoogleMapsLoaderHost = {};
		expect(() => installGoogleMapsLoader(host, { timeoutMs: 50_000 })).not.toThrow();
		expect(() => host.resolveGoogleLoaded?.()).not.toThrow();
	});

	it("lets early callers wait until the Maps callback provides google", async () => {
		const host: GoogleMapsLoaderHost = {};
		installGoogleMapsLoader(host, { timeoutMs: 50_000 });

		const pending = host.resolveGoogleLoaded?.();
		expect(pending).toBeInstanceOf(Promise);

		const google: GoogleMapsLike = { maps: {} };
		host.google = google;
		host.resolveGoogleLoaded?.();

		await expect(pending).resolves.toBe(google);
	});

	it("resolves immediately when Maps is already on the host", async () => {
		const google: GoogleMapsLike = { maps: {} };
		const host: GoogleMapsLoaderHost = { google };
		installGoogleMapsLoader(host, { timeoutMs: 50_000 });
		await expect(host.resolveGoogleLoaded?.()).resolves.toBe(google);
	});

	it("rejects on script onerror without a ReferenceError", async () => {
		const host: GoogleMapsLoaderHost = {};
		installGoogleMapsLoader(host, { timeoutMs: 50_000 });
		const pending = host.resolveGoogleLoaded?.();

		host.__googleMapsLoadFailed?.(new Error("Google Maps script failed to load"));

		await expect(pending).rejects.toThrow("Google Maps script failed to load");
	});

	it("times out if Maps never arrives", async () => {
		vi.useFakeTimers();
		const host: GoogleMapsLoaderHost = {};
		installGoogleMapsLoader(host, { timeoutMs: GOOGLE_MAPS_LOAD_TIMEOUT_MS });
		const pending = host.resolveGoogleLoaded?.();

		await vi.advanceTimersByTimeAsync(GOOGLE_MAPS_LOAD_TIMEOUT_MS);

		await expect(pending).rejects.toThrow("Google Maps load timed out");
	});

	it("is idempotent and keeps the original waiter", async () => {
		const host: GoogleMapsLoaderHost = {};
		const first = installGoogleMapsLoader(host, { timeoutMs: 50_000 });
		const second = installGoogleMapsLoader(host, { timeoutMs: 50_000 });
		expect(second).toBe(first);

		const google: GoogleMapsLike = { maps: {} };
		host.google = google;
		first();
		await expect(host.resolveGoogleLoaded?.()).resolves.toBe(google);
	});
});

describe("app.html Google Maps bootstrap", () => {
	const appHtml = readFileSync(path.resolve("./src/app.html"), "utf8");
	const bootstrap = appHtml.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1] ?? "";

	it("does not read an undeclared google identifier", () => {
		expect(bootstrap).toContain("window.google");
		expect(bootstrap).toContain("__googleMapsLoadFailed");
		expect(bootstrap).not.toMatch(/\bif\s*\(\s*!google\s*\)/);
		expect(bootstrap).not.toMatch(/Promise\.resolve\(\s*google\s*\)/);
	});

	it("does not throw when evaluated before Maps defines google", async () => {
		const windowObj: {
			google?: unknown;
			resolveGoogleLoaded?: () => Promise<unknown>;
			__googleMapsLoadFailed?: (reason?: unknown) => Promise<unknown>;
		} = {};
		const fn = new Function(
			"window",
			"Promise",
			"Error",
			"setTimeout",
			"clearTimeout",
			"console",
			bootstrap,
		);
		expect(() =>
			fn(windowObj, Promise, Error, () => 1, () => {}, console),
		).not.toThrow();

		const pending = windowObj.resolveGoogleLoaded?.();
		expect(pending).toBeInstanceOf(Promise);

		const maps = { maps: {} };
		windowObj.google = maps;
		windowObj.resolveGoogleLoaded?.();
		await expect(pending).resolves.toBe(maps);
	});
});
