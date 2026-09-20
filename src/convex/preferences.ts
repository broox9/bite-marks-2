import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { requireUserId } from './authHelpers';
import { preferencesSchema } from '../lib/core/domain/api';

const defaultLocation = v.union(v.null(), v.object({
  name: v.string(), lat: v.number(), lng: v.number(), radiusMeters: v.number(),
}));
export const get = query({
  args: {}, returns: v.object({ defaultLocation }),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const preferences = await ctx.db.query('preferences').withIndex('by_user', q => q.eq('userId', userId)).unique();
    return { defaultLocation: preferences?.defaultLocation ?? null };
  },
});
export const update = mutation({
  args: { defaultLocation }, returns: v.object({ defaultLocation }),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx, true);
    const data = preferencesSchema.parse(args);
    const existing = await ctx.db.query('preferences').withIndex('by_user', q => q.eq('userId', userId)).unique();
    if (existing) await ctx.db.patch(existing._id, data);
    else await ctx.db.insert('preferences', { userId, ...data });
    return data;
  },
});
