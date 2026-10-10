import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SavedLocation } from "$lib/core/domain/Location/Location";
import { locationStore } from "./location.store.svelte";

const FALLBACK_NAME = "Midtown, New York";

function savedDefault(id: string, name: string, lat: number, lng: number): SavedLocation {
  return { id, name, lat, lng, radiusMiles: 5, isDefault: true };
}

function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, String(value)),
  };
}

describe("locationStore.hydrate", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
    vi.spyOn(console, "warn").mockImplementation(() => {});
    locationStore.reset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("falls through to the saved default when reading storage throws", async () => {
    vi.stubGlobal("localStorage", {
      ...memoryStorage(),
      getItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    });
    const home = savedDefault("loc-a", "Brooklyn", 40.6782, -73.9442);

    await expect(locationStore.hydrate("user-a", async () => [home])).resolves.toBeUndefined();

    expect(locationStore.name).toBe("Brooklyn");
    expect(locationStore.center).toEqual({ lat: 40.6782, lng: -73.9442 });
    expect(locationStore.savedLocationId).toBe("loc-a");
  });

  it("does not carry one account's location into the next after reset", async () => {
    const aHome = savedDefault("loc-a", "Brooklyn", 40.6782, -73.9442);
    const bHome = savedDefault("loc-b", "Newark", 40.7357, -74.1724);

    await locationStore.hydrate("user-a", async () => [aHome]);
    expect(locationStore.savedLocationId).toBe("loc-a");

    locationStore.reset();
    expect(locationStore.name).toBe(FALLBACK_NAME);
    expect(locationStore.savedLocationId).toBeNull();

    const loadForB = vi.fn(async () => [bHome]);
    await locationStore.hydrate("user-b", loadForB);

    expect(loadForB).toHaveBeenCalledOnce();
    expect(locationStore.name).toBe("Newark");
    expect(locationStore.savedLocationId).toBe("loc-b");
  });

  it("keeps each account's cached pick on this device separate", async () => {
    const aHome = savedDefault("loc-a", "Brooklyn", 40.6782, -73.9442);
    await locationStore.hydrate("user-a", async () => [aHome]);
    locationStore.reset();

    // User B has no saved default: they must land on the fallback, not A's cache.
    await locationStore.hydrate("user-b", async () => []);
    expect(locationStore.name).toBe(FALLBACK_NAME);
    expect(locationStore.savedLocationId).toBeNull();
  });
});
