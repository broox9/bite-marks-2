import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { v } from "convex/values";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

export const DEV_CONVEX_DEPLOYMENT_NAME = "fastidious-setter-628";
export const DEV_PREVIEW_ORIGIN_PATTERN =
  "https://*-bite-marks-2.broox9.workers.dev";
export const LOCAL_DEV_ORIGIN = "http://localhost:5173";

type AuthEnv = Record<string, string | undefined>;

export function isDevConvexDeployment(env: AuthEnv = process.env): boolean {
  const candidates = [env.CONVEX_SITE_URL, env.CONVEX_CLOUD_URL];
  return candidates.some((raw) => {
    if (!raw) return false;
    try {
      const { hostname } = new URL(raw);
      return (
        hostname === `${DEV_CONVEX_DEPLOYMENT_NAME}.convex.site` ||
        hostname === `${DEV_CONVEX_DEPLOYMENT_NAME}.convex.cloud`
      );
    } catch {
      return false;
    }
  });
}

export function resolveTrustedOrigins(
  env: AuthEnv = process.env,
): string[] | undefined {
  if (!isDevConvexDeployment(env)) {
    return undefined;
  }

  const fromEnv = (env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(
    new Set([
      ...(env.SITE_URL ? [env.SITE_URL] : []),
      LOCAL_DEV_ORIGIN,
      DEV_PREVIEW_ORIGIN_PATTERN,
      ...fromEnv,
    ]),
  );
}

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const trustedOrigins = resolveTrustedOrigins();

  return betterAuth({
    baseURL: siteUrl,
    ...(trustedOrigins ? { trustedOrigins } : {}),
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders:
      googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : undefined,
    plugins: [convex({ authConfig })],
  });
};

export const getCurrentUser = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
