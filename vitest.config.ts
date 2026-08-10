import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
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
