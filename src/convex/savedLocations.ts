import { v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { assertUser, requireUserId } from "./authHelpers";
import {
  MAX_LOCATION_NAME_LENGTH,
  MAX_RADIUS_MILES,
  MAX_SAVED_LOCATIONS,
  MIN_RADIUS_MILES,
} from "../lib/core/domain/Location/limits";

const savedLocationValidator = v.object({
  _id: v.id("savedLocations"),
  _creationTime: v.number(),
  userId: v.string(),
  name: v.string(),
  lat: v.number(),
  lng: v.number(),
  radiusMiles: v.number(),
  isDefault: v.boolean(),
});

/** Oldest first, so the first entry is the natural successor when a default is deleted. */
async function listUserLocations(ctx: QueryCtx | MutationCtx, userId: string) {
  return await ctx.db
    .query("savedLocations")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .take(MAX_SAVED_LOCATIONS);
}

async function getOwnedLocation(
  ctx: QueryCtx | MutationCtx,
  locationId: Id<"savedLocations">,
  userId: string
): Promise<Doc<"savedLocations"> | null> {
  const location = await ctx.db.get("savedLocations", locationId);
  return location && location.userId === userId ? location : null;
}

function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Location name is required");
  if (trimmed.length > MAX_LOCATION_NAME_LENGTH) {
    throw new Error(`Location name must be ${MAX_LOCATION_NAME_LENGTH} characters or fewer`);
  }
  return trimmed;
}

function assertLatitude(lat: number) {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }
}

function assertLongitude(lng: number) {
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }
}

function assertRadius(radiusMiles: number) {
  if (
    !Number.isFinite(radiusMiles) ||
    radiusMiles < MIN_RADIUS_MILES ||
    radiusMiles > MAX_RADIUS_MILES
  ) {
    throw new Error(
      `Radius must be between ${MIN_RADIUS_MILES} and ${MAX_RADIUS_MILES} miles`
    );
  }
}

export const listForUser = query({
  args: { userId: v.string() },
  returns: v.array(savedLocationValidator),
  handler: async (ctx, { userId }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    return await listUserLocations(ctx, userId);
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    lat: v.number(),
    lng: v.number(),
    radiusMiles: v.number(),
  },
  returns: v.union(
    v.object({ success: v.literal(true), location: savedLocationValidator }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, args) => {
    const authUserId = await requireUserId(ctx);
    assertUser(args.userId, authUserId);

    const name = normalizeName(args.name);
    assertLatitude(args.lat);
    assertLongitude(args.lng);
    assertRadius(args.radiusMiles);

    const existing = await listUserLocations(ctx, args.userId);
    if (existing.length >= MAX_SAVED_LOCATIONS) {
      return {
        success: false as const,
        error: `You can save up to ${MAX_SAVED_LOCATIONS} locations. Delete one to save another.`,
      };
    }

    const id = await ctx.db.insert("savedLocations", {
      userId: args.userId,
      name,
      lat: args.lat,
      lng: args.lng,
      radiusMiles: args.radiusMiles,
      isDefault: !existing.some((location) => location.isDefault),
    });
    const location = await ctx.db.get("savedLocations", id);
    if (!location) return { success: false as const, error: "Failed to save location" };
    return { success: true as const, location };
  },
});

export const update = mutation({
  args: {
    locationId: v.id("savedLocations"),
    userId: v.string(),
    name: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    radiusMiles: v.optional(v.number()),
  },
  returns: v.union(savedLocationValidator, v.null()),
  handler: async (ctx, args) => {
    const authUserId = await requireUserId(ctx);
    assertUser(args.userId, authUserId);

    const location = await getOwnedLocation(ctx, args.locationId, args.userId);
    if (!location) return null;

    const patch: Partial<Doc<"savedLocations">> = {};
    if (args.name !== undefined) patch.name = normalizeName(args.name);
    if (args.lat !== undefined) {
      assertLatitude(args.lat);
      patch.lat = args.lat;
    }
    if (args.lng !== undefined) {
      assertLongitude(args.lng);
      patch.lng = args.lng;
    }
    if (args.radiusMiles !== undefined) {
      assertRadius(args.radiusMiles);
      patch.radiusMiles = args.radiusMiles;
    }

    await ctx.db.patch("savedLocations", args.locationId, patch);
    return await ctx.db.get("savedLocations", args.locationId);
  },
});

export const setDefault = mutation({
  args: { locationId: v.id("savedLocations"), userId: v.string() },
  returns: v.union(savedLocationValidator, v.null()),
  handler: async (ctx, { locationId, userId }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    const target = await getOwnedLocation(ctx, locationId, userId);
    if (!target) return null;

    const locations = await listUserLocations(ctx, userId);
    for (const location of locations) {
      const shouldBeDefault = location._id === locationId;
      if (location.isDefault !== shouldBeDefault) {
        await ctx.db.patch("savedLocations", location._id, { isDefault: shouldBeDefault });
      }
    }
    return await ctx.db.get("savedLocations", locationId);
  },
});

export const remove = mutation({
  args: { locationId: v.id("savedLocations"), userId: v.string() },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async (ctx, { locationId, userId }) => {
    const authUserId = await requireUserId(ctx);
    assertUser(userId, authUserId);

    const location = await getOwnedLocation(ctx, locationId, userId);
    if (!location) {
      return { success: false, error: "Location not found or not owned by user" };
    }
    await ctx.db.delete("savedLocations", locationId);

    if (location.isDefault) {
      const [successor] = await listUserLocations(ctx, userId);
      if (successor) {
        await ctx.db.patch("savedLocations", successor._id, { isDefault: true });
      }
    }
    return { success: true };
  },
});
