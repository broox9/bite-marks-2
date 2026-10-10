import type { ConvexHttpClient } from "convex/browser";
import type { Doc, Id } from "$convex/_generated/dataModel";
import { api } from "$convex/_generated/api";
import type { SavedLocation, SavedLocationInput } from "$lib/core/domain/Location/Location";
import type {
  CreateSavedLocationResult,
  SavedLocationRepository,
} from "$lib/ports/savedLocation.repository";

function toDomainLocation(doc: Doc<"savedLocations">): SavedLocation {
  return {
    id: doc._id,
    name: doc.name,
    lat: doc.lat,
    lng: doc.lng,
    radiusMiles: doc.radiusMiles,
    isDefault: doc.isDefault,
  };
}

export class ConvexSavedLocationRepository implements SavedLocationRepository {
  constructor(private client: ConvexHttpClient) {}

  async list(userId: string): Promise<SavedLocation[]> {
    const docs = await this.client.query(api.savedLocations.listForUser, { userId });
    return docs.map(toDomainLocation);
  }

  async create(userId: string, input: SavedLocationInput): Promise<CreateSavedLocationResult> {
    const result = await this.client.mutation(api.savedLocations.create, { userId, ...input });
    if (!result.success) return result;
    return { success: true, location: toDomainLocation(result.location) };
  }

  async update(
    userId: string,
    locationId: string,
    patch: Partial<SavedLocationInput>
  ): Promise<SavedLocation | null> {
    const doc = await this.client.mutation(api.savedLocations.update, {
      userId,
      locationId: locationId as Id<"savedLocations">,
      ...patch,
    });
    return doc ? toDomainLocation(doc) : null;
  }

  async setDefault(userId: string, locationId: string): Promise<SavedLocation | null> {
    const doc = await this.client.mutation(api.savedLocations.setDefault, {
      userId,
      locationId: locationId as Id<"savedLocations">,
    });
    return doc ? toDomainLocation(doc) : null;
  }

  async remove(userId: string, locationId: string): Promise<boolean> {
    const result = await this.client.mutation(api.savedLocations.remove, {
      userId,
      locationId: locationId as Id<"savedLocations">,
    });
    return result.success;
  }
}
