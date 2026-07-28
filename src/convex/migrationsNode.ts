"use node";

import { v } from "convex/values";
import { hashPassword } from "better-auth/crypto";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * One-off: set an email/password credential for an existing Better Auth user.
 *
 *   npx convex run migrationsNode:setPasswordForEmail \
 *     '{"email":"broox9@yahoo.com","password":"YOUR_PASSWORD_HERE"}'
 */
export const setPasswordForEmail = internalAction({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    const passwordHash = await hashPassword(password);
    return await ctx.runMutation(internal.migrations.applyCredentialPassword, {
      email,
      passwordHash,
    });
  },
});
