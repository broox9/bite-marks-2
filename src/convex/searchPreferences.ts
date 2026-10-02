import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./authHelpers";

const searchPreferenceValidator = v.object({
  _id: v.id("searchPreferences"),
  _creationTime: v.number(),
  userId: v.string(),
  locationName: v.string(),
  center: v.object({
    lat: v.number(),
    lng: v.number(),
  }),
  radiusMeters: v.number(),
  type: v.optional(v.string()),
});

export const getMine = query({
  args: {},
  returns: v.union(searchPreferenceValidator, v.null()),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("searchPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const upsertMine = mutation({
  args: {
    locationName: v.string(),
    center: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    radiusMeters: v.number(),
    type: v.optional(v.string()),
  },
  returns: searchPreferenceValidator,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (!args.locationName.trim()) throw new Error("Location name is required");
    if (args.center.lat < -90 || args.center.lat > 90) throw new Error("Invalid latitude");
    if (args.center.lng < -180 || args.center.lng > 180) throw new Error("Invalid longitude");
    if (args.radiusMeters < 1609.344 || args.radiusMeters > 48280.32) {
      throw new Error("Radius must be between 1 and 30 miles");
    }
    if (args.type && args.type.trim().length > 40) {
      throw new Error("Location label must be 40 characters or fewer");
    }

    const existing = await ctx.db
      .query("searchPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const values = {
      userId,
      locationName: args.locationName.trim(),
      center: args.center,
      radiusMeters: args.radiusMeters,
      type: args.type?.trim() || undefined,
    };

    if (existing) {
      await ctx.db.replace(existing._id, values);
      const updated = await ctx.db.get(existing._id);
      if (!updated) throw new Error("Failed to update search preferences");
      return updated;
    }

    const id = await ctx.db.insert("searchPreferences", values);
    const created = await ctx.db.get(id);
    if (!created) throw new Error("Failed to create search preferences");
    return created;
  },
});
