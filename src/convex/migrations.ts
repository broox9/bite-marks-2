import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { components } from "./_generated/api";
import { upsertPlaceDoc } from "./places";

const placeInput = v.object({
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

/**
 * Import Appwrite users into Better Auth (no passwords — Google accounts pre-linked when provided).
 * Returns a map of Appwrite user id → Better Auth user id.
 */
export const importUsers = internalMutation({
  args: {
    users: v.array(
      v.object({
        legacyUserId: v.string(),
        email: v.string(),
        name: v.string(),
        emailVerified: v.boolean(),
        createdAt: v.number(),
        googleAccountId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { users }) => {
    const mapping: Record<string, string> = {};

    for (const user of users) {
      const existing = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "email", value: user.email }],
      });

      let betterAuthUserId: string;
      if (existing) {
        betterAuthUserId = String((existing as any)._id ?? (existing as any).id);
      } else {
        const created = await ctx.runMutation(components.betterAuth.adapter.create, {
          input: {
            model: "user",
            data: {
              name: user.name || user.email.split("@")[0] || "User",
              email: user.email,
              emailVerified: user.emailVerified,
              createdAt: user.createdAt,
              updatedAt: Date.now(),
            },
          },
        });
        betterAuthUserId = String(
          (created as any)._id ?? (created as any).id ?? created
        );
      }

      mapping[user.legacyUserId] = betterAuthUserId;

      if (user.googleAccountId) {
        const existingAccount = await ctx.runQuery(
          components.betterAuth.adapter.findOne,
          {
            model: "account",
            where: [
              { field: "providerId", value: "google" },
              { field: "accountId", value: user.googleAccountId },
            ],
          }
        );
        if (!existingAccount) {
          await ctx.runMutation(components.betterAuth.adapter.create, {
            input: {
              model: "account",
              data: {
                accountId: user.googleAccountId,
                providerId: "google",
                userId: betterAuthUserId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            },
          });
        }
      }
    }

    return mapping;
  },
});

export const importPlaces = internalMutation({
  args: { places: v.array(placeInput) },
  handler: async (ctx, { places }) => {
    let upserted = 0;
    for (const place of places) {
      await upsertPlaceDoc(ctx, place);
      upserted += 1;
    }
    return { upserted };
  },
});

export const importSpots = internalMutation({
  args: {
    spots: v.array(
      v.object({
        legacyUserId: v.string(),
        userId: v.string(),
        placeId: v.string(),
        name: v.union(v.string(), v.null()),
        personalRating: v.union(v.number(), v.null()),
        personalNotes: v.union(v.string(), v.null()),
        isVisited: v.boolean(),
        socialLinks: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, { spots }) => {
    let inserted = 0;
    let skipped = 0;
    let missingPlace = 0;

    for (const spot of spots) {
      const place = await ctx.db
        .query("places")
        .withIndex("by_place_id", (q) => q.eq("placeId", spot.placeId))
        .unique();
      if (!place) {
        missingPlace += 1;
        continue;
      }

      const existing = await ctx.db
        .query("spots")
        .withIndex("by_user_place", (q) =>
          q.eq("userId", spot.userId).eq("placeId", spot.placeId)
        )
        .unique();
      if (existing) {
        skipped += 1;
        continue;
      }

      await ctx.db.insert("spots", {
        userId: spot.userId,
        place: place._id,
        placeId: spot.placeId,
        name: spot.name,
        personalRating: spot.personalRating,
        personalNotes: spot.personalNotes,
        isVisited: spot.isVisited,
        socialLinks: spot.socialLinks,
        legacyUserId: spot.legacyUserId,
      });
      inserted += 1;
    }

    return { inserted, skipped, missingPlace };
  },
});

export const importTags = internalMutation({
  args: {
    tags: v.array(
      v.object({
        userId: v.string(),
        tagName: v.string(),
      })
    ),
  },
  handler: async (ctx, { tags }) => {
    let inserted = 0;
    for (const tag of tags) {
      await ctx.db.insert("tags", tag);
      inserted += 1;
    }
    return { inserted };
  },
});

export const verifyMigration = internalMutation({
  args: {},
  handler: async (ctx) => {
    const places = await ctx.db.query("places").collect();
    const spots = await ctx.db.query("spots").collect();
    const tags = await ctx.db.query("tags").collect();

    let spotsMissingPlace = 0;
    for (const spot of spots) {
      const place = await ctx.db.get(spot.place);
      if (!place) spotsMissingPlace += 1;
    }

    const spotsByUser: Record<string, number> = {};
    for (const spot of spots) {
      spotsByUser[spot.userId] = (spotsByUser[spot.userId] ?? 0) + 1;
    }

    return {
      places: places.length,
      spots: spots.length,
      tags: tags.length,
      spotsMissingPlace,
      spotsByUser,
    };
  },
});

export const dropLegacyUserIds = internalMutation({
  args: {},
  handler: async (ctx) => {
    const spots = await ctx.db.query("spots").collect();
    let cleared = 0;
    for (const spot of spots) {
      if (spot.legacyUserId !== undefined) {
        await ctx.db.patch(spot._id, { legacyUserId: undefined });
        cleared += 1;
      }
    }
    return { cleared };
  },
});

/**
 * Apply a Better Auth password hash to a user identified by email.
 * Prefer migrationsNode:setPasswordForEmail so the password is hashed correctly.
 */
export const applyCredentialPassword = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, { email, passwordHash }) => {
    const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: email }],
    });
    if (!user) throw new Error(`No Better Auth user for email: ${email}`);

    const userId = String((user as { _id?: string; id?: string })._id ?? (user as { id?: string }).id);

    const existing = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "account",
      where: [
        { field: "userId", value: userId },
        { field: "providerId", value: "credential" },
      ],
    });

    if (existing) {
      const accountId = String((existing as { _id: string })._id);
      await ctx.runMutation(components.betterAuth.adapter.updateOne, {
        input: {
          model: "account",
          where: [{ field: "_id", value: accountId }],
          update: { password: passwordHash, updatedAt: Date.now() },
        },
      });
      return { status: "updated" as const, userId, email };
    }

    await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "account",
        data: {
          // Better Auth credential accounts use accountId === userId
          accountId: userId,
          providerId: "credential",
          userId,
          password: passwordHash,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      },
    });
    return { status: "created" as const, userId, email };
  },
});
