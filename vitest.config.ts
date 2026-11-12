import { defineConfig } from "vite-plus";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";

export default defineConfig({
  // Compiles runes in `.svelte.ts` modules (e.g. stores) for tests.
  plugins: [svelte()],
  resolve: {
    // Component tests need Svelte's client entry point for mount/unmount.
    conditions: ["browser"],
    alias: {
      $lib: path.resolve("./src/lib"),
      $convex: path.resolve("./src/convex"),
      $components: path.resolve("./src/components"),
    },
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
    exclude: ["**/node_modules/**", "**/dist/**", "**/.claude/worktrees/**", "**/.svelte-kit/**"],
  },
});
