import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertUser, requireUserId } from "./authHelpers";

const tagValidator = v.object({
  _id: v.id("tags"),
  _creationTime: v.number(),
  userId: v.string(),
  tagName: v.string(),
});

export const listForUser = query({
  args: { userId: v.string() },
  returns: v.array(tagValidator),
  handler: async (ctx, { userId }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    return await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
  },
});

export const create = mutation({
  args: { userId: v.string(), tagName: v.string() },
  returns: tagValidator,
  handler: async (ctx, { userId, tagName }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    const id = await ctx.db.insert("tags", { userId, tagName });
    const tag = await ctx.db.get(id);
    if (!tag) throw new Error("Failed to create tag");
    return tag;
  },
});
