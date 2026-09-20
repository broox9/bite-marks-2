export {};

declare global {
  interface Window {
    /**
     * Defined in `src/app.html` by the dynamic Maps JS bootstrap.
     * Resolves to the global `google` object once `importLibrary` is ready.
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
