export {};

declare global {
  interface Window {
    /**
     * Defined in `src/app.html` as the Google Maps JS callback.
     * Resolves to the global `google` object once the script has loaded.
     * Safe to call before Maps is ready — returns the same pending promise.
     */
    resolveGoogleLoaded?: () => Promise<any>;
    /**
     * Called from the Maps `<script onerror>` handler in `src/app.html`.
     */
    __googleMapsLoadFailed?: (reason?: unknown) => Promise<any>;
  }

  interface Platform {
      env: {
          COUNTER: DurableObjectNamespace;
      };
      context: {
          waitUntil(promise: Promise<any>): void;
      };
      caches: CacheStorage & { default: Cache }
  }
}
