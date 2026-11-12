import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { betterAuth } from "better-auth/minimal";
import { memoryAdapter } from "better-auth/adapters/memory";
import {
  DEV_PREVIEW_ORIGIN_PATTERN,
  LOCAL_DEV_ORIGIN,
  isDevConvexDeployment,
  resolveTrustedOrigins,
} from "./auth";
import {
  formatEnvProduction,
  isPreviewBuild,
  parseJsonc,
  resolveBuildVars,
} from "../../scripts/sync-wrangler-build-env.mjs";

describe("Convex auth trustedOrigins (dev vs prod isolation)", () => {
  it("identifies fastidious-setter-628 as the dev deployment", () => {
    expect(
      isDevConvexDeployment({
        CONVEX_SITE_URL: "https://fastidious-setter-628.convex.site",
      }),
    ).toBe(true);
    expect(
      isDevConvexDeployment({
        CONVEX_CLOUD_URL: "https://fastidious-setter-628.convex.cloud",
      }),
    ).toBe(true);
  });

  it("never identifies prod (agreeable-grouse-769) or unknown deployments as dev", () => {
    expect(
      isDevConvexDeployment({
        CONVEX_SITE_URL: "https://agreeable-grouse-769.convex.site",
        CONVEX_CLOUD_URL: "https://agreeable-grouse-769.convex.cloud",
      }),
    ).toBe(false);
    expect(isDevConvexDeployment({})).toBe(false);
    expect(
      isDevConvexDeployment({
        CONVEX_SITE_URL: "https://evil-fastidious-setter-628.convex.site",
      }),
    ).toBe(false);
  });

  it("returns undefined trustedOrigins on prod so prod origins never change", () => {
    expect(
      resolveTrustedOrigins({
        SITE_URL: "https://bite.broox.us",
        CONVEX_SITE_URL: "https://agreeable-grouse-769.convex.site",
        CONVEX_CLOUD_URL: "https://agreeable-grouse-769.convex.cloud",
      }),
    ).toBeUndefined();
  });

  it("returns scoped preview and local origins on dev deployment", () => {
    const origins = resolveTrustedOrigins({
      SITE_URL: "http://localhost:5173",
      CONVEX_SITE_URL: "https://fastidious-setter-628.convex.site",
      BETTER_AUTH_TRUSTED_ORIGINS:
        "https://*-bite-marks-2.broox9.workers.dev, https://custom-preview.example.com",
    });

    expect(origins).toEqual([
      LOCAL_DEV_ORIGIN,
      DEV_PREVIEW_ORIGIN_PATTERN,
      "https://custom-preview.example.com",
    ]);
  });

  it("matches Worker preview URLs for bite-marks-2 on dev and rejects them on prod", async () => {
    const devAuth = betterAuth({
      baseURL: "http://localhost:5173",
      secret: "test-secret-at-least-thirty-two-characters-long",
      database: memoryAdapter({}),
      trustedOrigins: resolveTrustedOrigins({
        SITE_URL: "http://localhost:5173",
        CONVEX_SITE_URL: "https://fastidious-setter-628.convex.site",
      }),
    });
    const devCtx = await devAuth.$context;

    expect(
      devCtx.isTrustedOrigin(
        "https://chore-update-toolchain-bite-marks-2.broox9.workers.dev",
      ),
    ).toBe(true);
    expect(
      devCtx.isTrustedOrigin(
        "https://a1b2c3d4-bite-marks-2.broox9.workers.dev",
      ),
    ).toBe(true);
    expect(devCtx.isTrustedOrigin("http://localhost:5173")).toBe(true);
    expect(
      devCtx.isTrustedOrigin("https://other-worker.broox9.workers.dev"),
    ).toBe(false);
    expect(
      devCtx.isTrustedOrigin(
        "http://chore-update-toolchain-bite-marks-2.broox9.workers.dev",
      ),
    ).toBe(false);

    const prodTrustedOrigins = resolveTrustedOrigins({
      SITE_URL: "https://bite.broox.us",
      CONVEX_SITE_URL: "https://agreeable-grouse-769.convex.site",
    });
    const prodAuth = betterAuth({
      baseURL: "https://bite.broox.us",
      secret: "test-secret-at-least-thirty-two-characters-long",
      database: memoryAdapter({}),
      ...(prodTrustedOrigins ? { trustedOrigins: prodTrustedOrigins } : {}),
    });
    const prodCtx = await prodAuth.$context;

    expect(prodCtx.isTrustedOrigin("https://bite.broox.us")).toBe(true);
    expect(
      prodCtx.isTrustedOrigin(
        "https://chore-update-toolchain-bite-marks-2.broox9.workers.dev",
      ),
    ).toBe(false);
    expect(prodCtx.isTrustedOrigin("http://localhost:5173")).toBe(false);
  });
});

describe("sync-wrangler-build-env preview vs production target resolution", () => {
  const wranglerConfig = parseJsonc(
    readFileSync(resolve(process.cwd(), "wrangler.jsonc"), "utf8"),
  );

  it("detects preview builds from CLI flags and CI branch variables", () => {
    expect(isPreviewBuild({ argv: [], env: {} })).toBe(false);
    expect(
      isPreviewBuild({ argv: [], env: { WORKERS_CI_BRANCH: "main" } }),
    ).toBe(false);
    expect(
      isPreviewBuild({
        argv: [],
        env: { WORKERS_CI_BRANCH: "chore/update-toolchain" },
      }),
    ).toBe(true);
    expect(
      isPreviewBuild({
        argv: [],
        env: { CF_PAGES_BRANCH: "feat/preview-test" },
      }),
    ).toBe(true);
    expect(isPreviewBuild({ argv: ["--preview"], env: {} })).toBe(true);
    expect(
      isPreviewBuild({
        argv: ["--prod"],
        env: { WORKERS_CI_BRANCH: "chore/update-toolchain" },
      }),
    ).toBe(false);
  });

  it("resolves prod Convex URLs for production builds and dev Convex URLs for preview builds", () => {
    const prod = resolveBuildVars(wranglerConfig, { preview: false });
    expect(prod.missing).toEqual([]);
    expect(prod.selected.PUBLIC_CONVEX_URL).toBe(
      "https://agreeable-grouse-769.convex.cloud",
    );
    expect(prod.selected.PUBLIC_CONVEX_SITE_URL).toBe(
      "https://agreeable-grouse-769.convex.site",
    );

    const preview = resolveBuildVars(wranglerConfig, { preview: true });
    expect(preview.missing).toEqual([]);
    expect(preview.selected.PUBLIC_CONVEX_URL).toBe(
      "https://fastidious-setter-628.convex.cloud",
    );
    expect(preview.selected.PUBLIC_CONVEX_SITE_URL).toBe(
      "https://fastidious-setter-628.convex.site",
    );

    const formatted = formatEnvProduction(
      preview.selected,
      "wrangler.jsonc previews.vars (preview)",
    );
    expect(formatted).toContain(
      "PUBLIC_CONVEX_URL=https://fastidious-setter-628.convex.cloud",
    );
    expect(formatted).toContain(
      "PUBLIC_CONVEX_SITE_URL=https://fastidious-setter-628.convex.site",
    );
  });
});
