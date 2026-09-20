import { v } from "convex/values";
import { query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from 'convex/server';
import { requireUserId } from './authHelpers';

export const placeValidator = v.object({
  _id: v.id("places"),
  _creationTime: v.number(),
  placeId: v.string(),
  name: v.string(),
  address: v.string(),
  rating: v.optional(v.number()),
  websiteURI: v.optional(v.union(v.string(), v.null())),
  priceLevel: v.string(),
  lat: v.number(),
  lng: v.number(),
  photos: v.array(v.any()),
  neighborhood: v.string(),
  areas: v.array(v.string()),
  placeTypes: v.array(v.string()),
  primaryType: v.optional(v.string()),
});

export const getAll = query({
  args: {},
  returns: v.array(placeValidator),
  handler: async (ctx) => {
    const places = await ctx.db.query("places").order("desc").take(200);
    return places;
  },
});

export const listPage = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({ page: v.array(placeValidator), isDone: v.boolean(), continueCursor: v.string() }),
  handler: async (ctx, { paginationOpts }) => {
    await requireUserId(ctx);
    const result = await ctx.db.query('places').order('desc')
      .paginate({ ...paginationOpts, numItems: Math.min(100, Math.max(1, paginationOpts.numItems)) });
    return { page: result.page, isDone: result.isDone, continueCursor: result.continueCursor };
  },
});

export const getByPlaceId = query({
  args: { placeId: v.string() },
  returns: v.union(placeValidator, v.null()),
  handler: async (ctx, { placeId }) => {
    return await ctx.db
      .query("places")
      .withIndex("by_place_id", (q) => q.eq("placeId", placeId))
      .unique();
  },
});

export const hasByPlaceId = query({
  args: { placeId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { placeId }) => {
    const place = await ctx.db
      .query("places")
      .withIndex("by_place_id", (q) => q.eq("placeId", placeId))
      .unique();
    return place !== null;
  },
});

/** Shared helper for spots.savePlaceAndSpot — upserts a place inside a mutation. */
export async function upsertPlaceDoc(
  ctx: MutationCtx,
  args: Omit<Doc<"places">, "_id" | "_creationTime">
): Promise<Id<"places">> {
  const existing = await ctx.db
    .query("places")
    .withIndex("by_place_id", (q) => q.eq("placeId", args.placeId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      name: args.name,
      address: args.address,
      rating: args.rating,
      websiteURI: args.websiteURI,
      priceLevel: args.priceLevel,
      lat: args.lat,
      lng: args.lng,
      photos: args.photos,
      neighborhood: args.neighborhood,
      areas: args.areas,
      placeTypes: args.placeTypes,
      primaryType: args.primaryType,
    });
    return existing._id;
  }

  return await ctx.db.insert("places", args);
}
