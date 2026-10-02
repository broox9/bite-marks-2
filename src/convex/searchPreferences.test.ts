import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

const preference = {
  locationName: "Downtown Brooklyn",
  center: { lat: 40.696, lng: -73.989 },
  radiusMeters: 8046.72,
  type: "Home",
};

describe("search preferences", () => {
  it("requires authentication", async () => {
    const t = convexTest(schema, modules);

    await expect(t.query(api.searchPreferences.getMine, {})).rejects.toThrow("Unauthorized");
    await expect(t.mutation(api.searchPreferences.upsertMine, preference)).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("creates and updates one preference record per user", async () => {
    const t = convexTest(schema, modules);
    const user = t.withIdentity({ subject: "user-a" });

    const created = await user.mutation(api.searchPreferences.upsertMine, preference);
    const updated = await user.mutation(api.searchPreferences.upsertMine, {
      ...preference,
      radiusMeters: 16093.44,
      type: undefined,
    });

    expect(updated._id).toBe(created._id);
    expect(await user.query(api.searchPreferences.getMine, {})).toMatchObject({
      locationName: "Downtown Brooklyn",
      radiusMeters: 16093.44,
      type: undefined,
    });
  });

  it("isolates preferences by authenticated user", async () => {
    const t = convexTest(schema, modules);
    const userA = t.withIdentity({ subject: "user-a" });
    const userB = t.withIdentity({ subject: "user-b" });

    await userA.mutation(api.searchPreferences.upsertMine, preference);

    expect(await userB.query(api.searchPreferences.getMine, {})).toBeNull();
  });
});
