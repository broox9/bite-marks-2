import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertUser, requireUserId } from "./authHelpers";

export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    return await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: { userId: v.string(), tagName: v.string() },
  handler: async (ctx, { userId, tagName }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    const id = await ctx.db.insert("tags", { userId, tagName });
    return await ctx.db.get(id);
  },
});
