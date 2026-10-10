import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { MAX_SAVED_LOCATIONS } from "../lib/core/domain/Location/limits";

const modules = import.meta.glob("./**/*.*s");

const location = { name: "Home", lat: 40.7, lng: -73.9, radiusMiles: 5 };

function setup() {
  const t = convexTest(schema, modules);
  return {
    t,
    userA: t.withIdentity({ subject: "user-a" }),
    userB: t.withIdentity({ subject: "user-b" }),
  };
}

async function createFor(
  user: ReturnType<typeof setup>["userA"],
  name: string,
  userId = "user-a"
) {
  const result = await user.mutation(api.savedLocations.create, { userId, ...location, name });
  if (!result.success) throw new Error(result.error);
  return result.location;
}

describe("savedLocations authorization", () => {
  it("rejects anonymous reads and writes", async () => {
    const { t } = setup();

    await expect(
      t.query(api.savedLocations.listForUser, { userId: "user-a" })
    ).rejects.toThrow("Unauthorized");
    await expect(
      t.mutation(api.savedLocations.create, { userId: "user-a", ...location })
    ).rejects.toThrow("Unauthorized");
  });

  it("prevents one user from reading or changing another user's locations", async () => {
    const { userA, userB } = setup();
    const home = await createFor(userA, "Home");

    await expect(
      userB.query(api.savedLocations.listForUser, { userId: "user-a" })
    ).rejects.toThrow("Forbidden");

    // Passing their own userId with someone else's location id finds nothing.
    expect(
      await userB.mutation(api.savedLocations.update, {
        userId: "user-b",
        locationId: home._id,
        name: "Hijacked",
      })
    ).toBeNull();
    expect(
      await userB.mutation(api.savedLocations.setDefault, {
        userId: "user-b",
        locationId: home._id,
      })
    ).toBeNull();
    expect(
      await userB.mutation(api.savedLocations.remove, {
        userId: "user-b",
        locationId: home._id,
      })
    ).toMatchObject({ success: false });

    const [unchanged] = await userA.query(api.savedLocations.listForUser, { userId: "user-a" });
    expect(unchanged).toMatchObject({ name: "Home", isDefault: true });
  });
});

describe("savedLocations rules", () => {
  it("makes the first saved location the default, and only the first", async () => {
    const { userA } = setup();
    const home = await createFor(userA, "Home");
    const work = await createFor(userA, "Work");

    expect(home.isDefault).toBe(true);
    expect(work.isDefault).toBe(false);
  });

  it(`caps each user at ${MAX_SAVED_LOCATIONS} saved locations`, async () => {
    const { userA, userB } = setup();
    for (let i = 0; i < MAX_SAVED_LOCATIONS; i++) {
      await createFor(userA, `Place ${i}`);
    }

    const overLimit = await userA.mutation(api.savedLocations.create, {
      userId: "user-a",
      ...location,
    });
    expect(overLimit).toEqual({
      success: false,
      error: `You can save up to ${MAX_SAVED_LOCATIONS} locations. Delete one to save another.`,
    });

    // The cap is per user.
    await expect(createFor(userB, "Home", "user-b")).resolves.toMatchObject({ isDefault: true });
  });

  it("keeps exactly one default when the default changes", async () => {
    const { userA } = setup();
    await createFor(userA, "Home");
    const work = await createFor(userA, "Work");

    await userA.mutation(api.savedLocations.setDefault, {
      userId: "user-a",
      locationId: work._id,
    });

    const locations = await userA.query(api.savedLocations.listForUser, { userId: "user-a" });
    expect(locations.filter((l) => l.isDefault).map((l) => l.name)).toEqual(["Work"]);
  });

  it("promotes the oldest remaining location when the default is deleted", async () => {
    const { userA } = setup();
    const home = await createFor(userA, "Home");
    await createFor(userA, "Work");
    await createFor(userA, "Gym");

    await userA.mutation(api.savedLocations.remove, { userId: "user-a", locationId: home._id });

    const locations = await userA.query(api.savedLocations.listForUser, { userId: "user-a" });
    expect(locations.map((l) => [l.name, l.isDefault])).toEqual([
      ["Work", true],
      ["Gym", false],
    ]);
  });

  it("updates name and radius, trimming the name", async () => {
    const { userA } = setup();
    const home = await createFor(userA, "Home");

    const updated = await userA.mutation(api.savedLocations.update, {
      userId: "user-a",
      locationId: home._id,
      name: "  Apartment ",
      radiusMiles: 12,
    });
    expect(updated).toMatchObject({ name: "Apartment", radiusMiles: 12, lat: 40.7 });
  });

  it("rejects blank names and out-of-range radii", async () => {
    const { userA } = setup();

    await expect(
      userA.mutation(api.savedLocations.create, { userId: "user-a", ...location, name: "  " })
    ).rejects.toThrow("Location name is required");
    await expect(
      userA.mutation(api.savedLocations.create, { userId: "user-a", ...location, radiusMiles: 50 })
    ).rejects.toThrow("Radius must be between");
  });
});
