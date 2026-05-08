import { describe, expect, it, vi } from "vitest";

import { AppwriteAdapter } from "./index";

vi.mock("./server-client.server", () => ({
  COLLECTIONS: {
    masterPlaces: "master_places",
    userPlaces: "user_places",
  },
  DATABASE_ID: "bite_marks",
  ID: {
    unique: () => "generated-row-id",
  },
  Query: {
    equal: (field: string, value: unknown) => `equal("${field}", ${JSON.stringify(value)})`,
    limit: (value: number) => `limit(${value})`,
    orderDesc: (field: string) => `orderDesc("${field}")`,
    select: (fields: string[]) => `select(${JSON.stringify(fields)})`,
  },
  createAdminTablesDB: vi.fn(),
}));

const place = {
  id: "place-1",
  place_id: "place-1",
  name: "Test Spot",
  address: "1 Main St",
  rating: 4.2,
  websiteURI: "https://example.com",
  price_level: "moderate",
  lat: 40.7,
  lng: -73.9,
  photos: [],
  neighborhood: "SoHo",
  areas: ["NY"],
  place_types: ["restaurant"],
};

describe("AppwriteAdapter", () => {
  it("returns the row created by TablesDB when saving a place and user spot", async () => {
    const savedPlaceRow = { $id: "place-1", ...place };
    const savedUserSpotRow = {
      $id: "user-spot-1",
      place_id: ["place-1"],
      user_id: "user-1",
      name: "Test Spot",
      personal_rating: null,
      personal_notes: null,
      is_visited: false,
      social_links: [],
    };
    const db = {
      listRows: vi.fn().mockResolvedValue({ total: 0, rows: [] }),
      createTransaction: vi.fn().mockResolvedValue({ $id: "tx-1" }),
      upsertRow: vi.fn().mockResolvedValue(savedPlaceRow),
      createRow: vi.fn().mockResolvedValue(savedUserSpotRow),
      updateTransaction: vi.fn().mockResolvedValue({ $id: "tx-1", status: "committed" }),
    };
    const adapter = new AppwriteAdapter(() => db);

    const result = await adapter.savePlaceAndSpot(place, "user-1");

    expect(result).toEqual({ success: true, spotResult: savedUserSpotRow });
    expect(db.updateTransaction).toHaveBeenCalledWith({ transactionId: "tx-1", commit: true });
  });
});
