export type GoogleMapsImportLibrary = (
  library: string,
  ...rest: unknown[]
) => Promise<unknown>;

export type GoogleMapsRoot = {
  google?: {
    maps?: {
      importLibrary?: GoogleMapsImportLibrary;
    };
  };
};

export class GoogleMapsLoadError extends Error {
  override name = "GoogleMapsLoadError";
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_POLL_MS = 50;

export function getMapsImportLibrary(
  root: GoogleMapsRoot = globalThis as GoogleMapsRoot,
): GoogleMapsImportLibrary | undefined {
  const maps = root.google?.maps;
  const importLibrary = maps?.importLibrary;
  if (typeof importLibrary !== "function") return undefined;
  return importLibrary.bind(maps);
}

export async function importMapsLibrary<T = unknown>(
  library: string,
  root: GoogleMapsRoot = globalThis as GoogleMapsRoot,
): Promise<T> {
  const importLibrary = getMapsImportLibrary(root);
  if (!importLibrary) {
    throw new GoogleMapsLoadError(
      `Google Maps importLibrary is unavailable (library=${library})`,
    );
  }
  return (await importLibrary(library)) as T;
}

export async function waitForGoogleMaps(
  options: {
    timeoutMs?: number;
    pollMs?: number;
    root?: GoogleMapsRoot;
  } = {},
): Promise<NonNullable<GoogleMapsRoot["google"]>> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    pollMs = DEFAULT_POLL_MS,
    root = globalThis as GoogleMapsRoot,
  } = options;
  const startedAt = Date.now();

  while (Date.now() - startedAt <= timeoutMs) {
    const importLibrary = getMapsImportLibrary(root);
    if (importLibrary) {
      await importLibrary("core");
      if (!root.google) {
        throw new GoogleMapsLoadError(
          "Google Maps loaded without a google namespace",
        );
      }
      return root.google;
    }

    await delay(pollMs);
  }

  throw new GoogleMapsLoadError("Google Maps failed to become ready");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
