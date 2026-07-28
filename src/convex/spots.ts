import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { assertUser, requireUserId } from "./authHelpers";
import { upsertPlaceDoc } from "./places";

/** Flattened spot + place shape consumed by the SvelteKit adapter. */
export type FlattenedSpot = {
  _id: Id<"spots">;
  userId: string;
  placeId: string;
  name: string | null;
  personalRating: number | null;
  personalNotes: string | null;
  isVisited: boolean;
  socialLinks: string[];
  place: Doc<"places"> | null;
};

async function flattenSpot(
  ctx: { db: { get: (id: Id<"places">) => Promise<Doc<"places"> | null> } },
  spot: Doc<"spots">
): Promise<FlattenedSpot> {
  const place = await ctx.db.get(spot.place);
  return {
    _id: spot._id,
    userId: spot.userId,
    placeId: spot.placeId,
    name: spot.name,
    personalRating: spot.personalRating,
    personalNotes: spot.personalNotes,
    isVisited: spot.isVisited,
    socialLinks: spot.socialLinks,
    place,
  };
}

export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    const spots = await ctx.db
      .query("spots")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);

    const rows = await Promise.all(spots.map((s) => flattenSpot(ctx, s)));
    return { total: rows.length, rows };
  },
});

export const getById = query({
  args: { rowId: v.id("spots"), userId: v.string() },
  handler: async (ctx, { rowId, userId }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    const spot = await ctx.db.get(rowId);
    if (!spot || spot.userId !== userId) return null;
    return flattenSpot(ctx, spot);
  },
});

export const hasForUserPlace = query({
  args: { userId: v.string(), placeId: v.string() },
  handler: async (ctx, { userId, placeId }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    const existing = await ctx.db
      .query("spots")
      .withIndex("by_user_place", (q) =>
        q.eq("userId", userId).eq("placeId", placeId)
      )
      .unique();
    return existing !== null;
  },
});

export const update = mutation({
  args: {
    rowId: v.id("spots"),
    userId: v.string(),
    personalRating: v.optional(v.union(v.number(), v.null())),
    personalNotes: v.optional(v.union(v.string(), v.null())),
    isVisited: v.optional(v.boolean()),
    socialLinks: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const authUserId = await requireUserId(ctx);
    assertUser(args.userId, authUserId);

    const spot = await ctx.db.get(args.rowId);
    if (!spot || spot.userId !== args.userId) return null;

    const patch: Partial<Doc<"spots">> = {};
    if (args.personalRating !== undefined) patch.personalRating = args.personalRating;
    if (args.personalNotes !== undefined) patch.personalNotes = args.personalNotes;
    if (args.isVisited !== undefined) patch.isVisited = args.isVisited;
    if (args.socialLinks !== undefined) patch.socialLinks = args.socialLinks;

    await ctx.db.patch(args.rowId, patch);
    const updated = await ctx.db.get(args.rowId);
    if (!updated) return null;
    return flattenSpot(ctx, updated);
  },
});

export const remove = mutation({
  args: { rowId: v.id("spots"), userId: v.string() },
  handler: async (ctx, { rowId, userId }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    const spot = await ctx.db.get(rowId);
    if (!spot || spot.userId !== userId) {
      return { success: false, error: "Spot not found or not owned by user" };
    }
    await ctx.db.delete(rowId);
    return { success: true };
  },
});

export const savePlaceAndSpot = mutation({
  args: {
    userId: v.string(),
    place: v.object({
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
    }),
  },
  handler: async (ctx, { userId, place }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    const existing = await ctx.db
      .query("spots")
      .withIndex("by_user_place", (q) =>
        q.eq("userId", userId).eq("placeId", place.placeId)
      )
      .unique();

    if (existing) {
      return {
        success: true,
        spotResult: await flattenSpot(ctx, existing),
        alreadyExisted: true,
      };
    }

    const placeDocId = await upsertPlaceDoc(ctx, place);
    const spotId = await ctx.db.insert("spots", {
      userId,
      place: placeDocId,
      placeId: place.placeId,
      name: place.name,
      personalRating: null,
      personalNotes: null,
      isVisited: false,
      socialLinks: [],
    });

    const spot = await ctx.db.get(spotId);
    if (!spot) return { success: false, error: "Failed to create spot" };

    return {
      success: true,
      spotResult: await flattenSpot(ctx, spot),
      alreadyExisted: false,
    };
  },
});
