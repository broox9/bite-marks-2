import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertUser, requireUserId } from "./authHelpers";
import { paginationOptsValidator } from 'convex/server';
import { tagInputSchema } from '../lib/core/domain/api';

const tagValidator = v.object({
  _id: v.id("tags"),
  _creationTime: v.number(),
  userId: v.string(),
  tagName: v.string(),
  updatedAt: v.optional(v.number()),
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
    const authUserId = await requireUserId(ctx, true);
    assertUser(userId, authUserId);
    tagName = tagInputSchema.parse({ tagName }).tagName;

    const id = await ctx.db.insert("tags", { userId, tagName, updatedAt: Date.now() });
    const tag = await ctx.db.get(id);
    if (!tag) throw new Error("Failed to create tag");
    return tag;
  },
});

export const listPage = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({ page: v.array(tagValidator), isDone: v.boolean(), continueCursor: v.string() }),
  handler: async (ctx, { paginationOpts }) => {
    const userId = await requireUserId(ctx);
    const result = await ctx.db.query('tags').withIndex('by_user', q => q.eq('userId', userId))
      .order('desc').paginate({ ...paginationOpts, numItems: Math.min(100, Math.max(1, paginationOpts.numItems)) });
    return { page: result.page, isDone: result.isDone, continueCursor: result.continueCursor };
  },
});

export const get = query({
  args: { id: v.id('tags') }, returns: v.union(tagValidator, v.null()),
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const tag = await ctx.db.get(id);
    return tag?.userId === userId ? tag : null;
  },
});

export const update = mutation({
  args: { id: v.id('tags'), tagName: v.string() }, returns: v.union(tagValidator, v.null()),
  handler: async (ctx, { id, tagName }) => {
    const userId = await requireUserId(ctx, true);
    const tag = await ctx.db.get(id);
    if (!tag || tag.userId !== userId) return null;
    await ctx.db.patch(id, { ...tagInputSchema.parse({ tagName }), updatedAt: Date.now() });
    return ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id('tags') }, returns: v.boolean(),
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx, true);
    const tag = await ctx.db.get(id);
    if (!tag || tag.userId !== userId) return false;
    await ctx.db.delete(id);
    return true;
  },
});
