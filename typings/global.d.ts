export {};

declare global {
  interface Window {
    /**
     * Defined in `src/app.html` as the Google Maps JS callback.
     * Resolves to the global `google` object once the script has loaded.
     */
    resolveGoogleLoaded?: () => Promise<any>;
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
