const DYNAMIC_IMPORT_FAILURE =
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS for/;

const STORAGE_KEY = "bite-marks:chunk-reload-at";

/** One automatic reload per window, then let a repeat reach Sentry. */
export const CHUNK_RELOAD_WINDOW_MS = 10_000;

export type ReloadStorage = {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
};

type PreloadErrorEvent = Event & { payload?: unknown };

export function isDynamicImportFailure(error: unknown): boolean {
    const message =
        error instanceof Error ? error.message : typeof error === "string" ? error : "";
    return DYNAMIC_IMPORT_FAILURE.test(message);
}

/**
 * Returns true when this failure should trigger a reload.
 * A second failure inside the window returns false so a persistent miss
 * cannot reload forever.
 */
export function claimChunkReload(
    storage: ReloadStorage,
    now: number,
    windowMs = CHUNK_RELOAD_WINDOW_MS,
): boolean {
    try {
        const raw = storage.getItem(STORAGE_KEY);
        const previous = raw == null ? Number.NaN : Number(raw);
        if (Number.isFinite(previous) && now - previous < windowMs) return false;
        storage.setItem(STORAGE_KEY, String(now));
        return true;
    } catch {
        return false;
    }
}

export function createChunkReloadHandler(options: {
    storage: ReloadStorage;
    reload: () => void;
    now?: () => number;
}): (event: Event) => void {
    const now = options.now ?? Date.now;
    return (event) => {
        const payload = (event as PreloadErrorEvent).payload;
        if (!isDynamicImportFailure(payload)) return;
        if (!claimChunkReload(options.storage, now())) return;
        event.preventDefault();
        options.reload();
    };
}

export function installChunkReloadRecovery(
    target: Pick<Window, "addEventListener">,
    options: {
        storage: ReloadStorage;
        reload: () => void;
        now?: () => number;
    },
): void {
    target.addEventListener("vite:preloadError", createChunkReloadHandler(options));
}
