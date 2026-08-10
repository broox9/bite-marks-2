import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Shared catalog of places, keyed by the Google Places id.
  places: defineTable({
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
  }).index("by_place_id", ["placeId"]),

  // A user's saved spot, pointing at a shared place.
  spots: defineTable({
    userId: v.string(),
    place: v.id("places"),
    placeId: v.string(),
    name: v.union(v.string(), v.null()),
    personalRating: v.union(v.number(), v.null()),
    personalNotes: v.union(v.string(), v.null()),
    isVisited: v.boolean(),
    socialLinks: v.array(v.string()),
    // Appwrite $id, populated by the migration and dropped once it completes.
    legacyUserId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_place", ["userId", "placeId"])
    .index("by_legacy_user", ["legacyUserId"]),

  tags: defineTable({
    userId: v.string(),
    tagName: v.string(),
  }).index("by_user", ["userId"]),
});
