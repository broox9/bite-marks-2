import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { v } from "convex/values";
import authConfig from "./auth.config";
import authSchema from './betterAuth/schema';
import { connectorPlugins } from './oauthOptions';
import type { BetterAuthOptions } from 'better-auth';

// Local component schema/adapter analysis runs without deployment environment variables.
const siteUrl = process.env.SITE_URL ?? 'http://localhost:5173';

export const authComponent = createClient<DataModel, typeof authSchema>(components.betterAuth, { local: { schema: authSchema } });

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  // #region agent log
  fetch("http://127.0.0.1:7724/ingest/5ad7bcdf-f199-4e71-9ae6-e700736dd1c7",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"b32ac3"},body:JSON.stringify({sessionId:"b32ac3",runId:"initial",hypothesisId:"A,B,C",location:"src/convex/auth.ts:17",message:"Better Auth production OAuth configuration evaluated",data:{baseURL:siteUrl,googleProviderEnabled:Boolean(googleClientId&&googleClientSecret),googleClientIdSuffix:googleClientId?.slice(-12)??null,callbackURL:`${siteUrl}/api/auth/callback/google`},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  return {
    baseURL: siteUrl,
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
    plugins: [...connectorPlugins(siteUrl), convex({ authConfig })],
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth(createAuthOptions(ctx));

export const getCurrentUser = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
