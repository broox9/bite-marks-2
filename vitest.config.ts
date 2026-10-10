import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";

export default defineConfig({
  // Compiles runes in `.svelte.ts` modules (e.g. stores) for tests.
  plugins: [svelte()],
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
      $convex: path.resolve("./src/convex"),
      $components: path.resolve("./src/components"),
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
