import { defineConfig } from "vitest/config";
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
      $app: path.resolve("./node_modules/@sveltejs/kit/src/runtime/app"),
    },
  },
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.claude/worktrees/**",
      "**/.svelte-kit/**",
    ],
  },
});
