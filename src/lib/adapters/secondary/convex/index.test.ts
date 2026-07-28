import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConvexAdapter } from "./index";

function makeClient(overrides: Record<string, any> = {}) {
  return {
    query: vi.fn(),
    mutation: vi.fn(),
    ...overrides,
  } as any;
}

describe("ConvexAdapter", () => {
  let client: ReturnType<typeof makeClient>;
  let adapter: ConvexAdapter;

  beforeEach(() => {
    client = makeClient();
    adapter = new ConvexAdapter(client);
  });

  it("maps listForUser rows into domain spots with total", async () => {
    client.query.mockResolvedValue({
      total: 1,
      rows: [
        {
          _id: "spot_1",
          userId: "user_1",
          placeId: "ChIJ",
          name: "Cafe",
          personalRating: 4,
          personalNotes: null,
          isVisited: true,
          socialLinks: [],
          place: {
            placeId: "ChIJ",
            name: "Cafe",
            address: "1 Main",
            priceLevel: "moderate",
            lat: 1,
            lng: 2,
            photos: [],
            neighborhood: "N",
            areas: ["A"],
            placeTypes: ["cafe"],
          },
        },
      ],
    });

    const result = await adapter.getUserSpots("user_1");
    expect(client.query).toHaveBeenCalled();
    expect(result.total).toBe(1);
    expect(result.rows[0].id).toBe("spot_1");
    expect(result.rows[0].place_id).toBe("ChIJ");
    expect(result.rows[0].personal_rating).toBe(4);
    expect(result.rows[0].is_visited).toBe(true);
    expect(result.rows[0].lat).toBe(1);
  });

  it("returns null from getUserSpot when missing", async () => {
    client.query.mockResolvedValue(null);
    const result = await adapter.getUserSpot("spot_1", "user_1");
    expect(result).toBeNull();
  });

  it("passes placeId for hasUserSpot dedupe", async () => {
    client.query.mockResolvedValue(true);
    const result = await adapter.hasUserSpot("ChIJ123", "user_1");
    expect(result).toBe(true);
    expect(client.query).toHaveBeenCalled();
  });
});
