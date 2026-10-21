import { describe, expect, it, vi } from "vitest";

import {
    CHUNK_RELOAD_WINDOW_MS,
    claimChunkReload,
    createChunkReloadHandler,
    isDynamicImportFailure,
    type ReloadStorage,
} from "./chunk-reload";

function memoryStorage(): ReloadStorage & { items: Map<string, string> } {
    const items = new Map<string, string>();
    return {
        items,
        getItem: (key) => items.get(key) ?? null,
        setItem: (key, value) => {
            items.set(key, value);
        },
    };
}

function preloadError(payload: unknown): Event & { payload?: unknown } {
    const event = new Event("vite:preloadError", { cancelable: true });
    return Object.assign(event, { payload });
}

describe("isDynamicImportFailure", () => {
    it("matches browser dynamic import failures", () => {
        expect(
            isDynamicImportFailure(
                new TypeError("Failed to fetch dynamically imported module: https://example.test/node.js"),
            ),
        ).toBe(true);
        expect(
            isDynamicImportFailure(new TypeError("Importing a module script failed.")),
        ).toBe(true);
        expect(
            isDynamicImportFailure(new TypeError("error loading dynamically imported module")),
        ).toBe(true);
        expect(
            isDynamicImportFailure(new Error("Unable to preload CSS for https://example.test/app.css")),
        ).toBe(true);
    });

    it("ignores unrelated failures", () => {
        expect(isDynamicImportFailure(new TypeError("Failed to fetch"))).toBe(false);
        expect(isDynamicImportFailure("Failed to fetch dynamically imported module")).toBe(true);
        expect(isDynamicImportFailure(undefined)).toBe(false);
        expect(isDynamicImportFailure({ message: "Failed to fetch dynamically imported module" })).toBe(
            false,
        );
    });
});

describe("claimChunkReload", () => {
    it("allows one reload inside the window", () => {
        const storage = memoryStorage();
        expect(claimChunkReload(storage, 1_000)).toBe(true);
        expect(claimChunkReload(storage, 1_000 + CHUNK_RELOAD_WINDOW_MS - 1)).toBe(false);
        expect(claimChunkReload(storage, 1_000 + CHUNK_RELOAD_WINDOW_MS)).toBe(true);
    });

    it("does not reload when storage is unavailable", () => {
        const storage: ReloadStorage = {
            getItem: () => {
                throw new Error("blocked");
            },
            setItem: () => {
                throw new Error("blocked");
            },
        };
        expect(claimChunkReload(storage, 1_000)).toBe(false);
    });
});

describe("createChunkReloadHandler", () => {
    it("reloads once and lets a repeat surface", () => {
        const storage = memoryStorage();
        const reload = vi.fn();
        let now = 5_000;
        const handle = createChunkReloadHandler({
            storage,
            reload,
            now: () => now,
        });

        const first = preloadError(
            new TypeError("Failed to fetch dynamically imported module: https://example.test/nodes/1.js"),
        );
        handle(first);
        expect(first.defaultPrevented).toBe(true);
        expect(reload).toHaveBeenCalledOnce();

        now += 1_000;
        const second = preloadError(
            new TypeError("Failed to fetch dynamically imported module: https://example.test/nodes/1.js"),
        );
        handle(second);
        expect(second.defaultPrevented).toBe(false);
        expect(reload).toHaveBeenCalledOnce();
    });

    it("ignores preload events that are not chunk load failures", () => {
        const reload = vi.fn();
        const handle = createChunkReloadHandler({
            storage: memoryStorage(),
            reload,
            now: () => 0,
        });
        const event = preloadError(new TypeError("Failed to fetch"));
        handle(event);
        expect(event.defaultPrevented).toBe(false);
        expect(reload).not.toHaveBeenCalled();
    });
});
