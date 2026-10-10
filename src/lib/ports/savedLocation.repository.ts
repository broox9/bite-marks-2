import type { SavedLocation, SavedLocationInput } from "$lib/core/domain/Location/Location";

export type CreateSavedLocationResult =
  | { success: true; location: SavedLocation }
  | { success: false; error: string };

export interface SavedLocationRepository {
  list: (userId: string) => Promise<SavedLocation[]>;
  create: (userId: string, input: SavedLocationInput) => Promise<CreateSavedLocationResult>;
  update: (
    userId: string,
    locationId: string,
    patch: Partial<SavedLocationInput>
  ) => Promise<SavedLocation | null>;
  setDefault: (userId: string, locationId: string) => Promise<SavedLocation | null>;
  remove: (userId: string, locationId: string) => Promise<boolean>;
}
