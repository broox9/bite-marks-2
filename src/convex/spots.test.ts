import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

const place = {
  placeId: "place-1",
  name: "Test Cafe",
  address: "1 Main Street",
  priceLevel: "moderate",
  lat: 40.7,
  lng: -73.9,
  photos: [],
  neighborhood: "SoHo",
  areas: ["Manhattan"],
  placeTypes: ["cafe"],
};

describe("spots authorization", () => {
  it("rejects anonymous writes", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.mutation(api.spots.savePlaceAndSpot, { userId: "user-a", place })
    ).rejects.toThrow("Unauthorized");
  });

  it("prevents one user from reading or mutating another user's spots", async () => {
    const t = convexTest(schema, modules);
    const userA = t.withIdentity({ subject: "user-a" });
    const userB = t.withIdentity({ subject: "user-b" });

    const created = await userA.mutation(api.spots.savePlaceAndSpot, {
      userId: "user-a",
      place,
    });
    expect(created.success).toBe(true);
    if (!created.success) throw new Error(created.error);

    await expect(
      userB.query(api.spots.getById, {
        rowId: created.spotResult._id,
        userId: "user-a",
      })
    ).rejects.toThrow("Forbidden");

    await expect(
      userB.mutation(api.spots.update, {
        rowId: created.spotResult._id,
        userId: "user-a",
        isVisited: true,
      })
    ).rejects.toThrow("Forbidden");
  });

  it("prevents anonymous and cross-user tag access", async () => {
    const t = convexTest(schema, modules);
    const userA = t.withIdentity({ subject: "user-a" });
    const userB = t.withIdentity({ subject: "user-b" });

    await expect(
      t.mutation(api.tags.create, { userId: "user-a", tagName: "brunch" })
    ).rejects.toThrow("Unauthorized");

    await userA.mutation(api.tags.create, {
      userId: "user-a",
      tagName: "brunch",
    });

    await expect(
      userB.query(api.tags.listForUser, { userId: "user-a" })
    ).rejects.toThrow("Forbidden");
  });
});
