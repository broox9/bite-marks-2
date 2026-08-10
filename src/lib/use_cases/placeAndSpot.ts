import type { MasterPlaceRecord } from "$lib/core/domain/Place/Place";
import type { UserSpotRecord } from "$lib/core/domain/Spot/Spot";
import type { PersistenceRepository } from "$lib/ports/persistence.repository";

export class PlaceAndSpotUseCase {
  constructor(private persistenceRepository: PersistenceRepository) {}

  async getSpots(userId: string) {
    return this.persistenceRepository.getUserSpots(userId);
  }

  async getSpotByPlaceId(placeId: string, userId: string) {
    const result = await this.persistenceRepository.getUserSpot(placeId, userId);
    if (!result) return null;
    // Convex adapter already attaches rowId; Appwrite rows expose $id.
    const rowId = result.rowId ?? result.$id ?? result.id;
    return { ...result, rowId };
  }

  async updateSpot(rowId: string, data: Partial<UserSpotRecord>, userId: string) {
    const result = await this.persistenceRepository.updateUserSpot(rowId, data, userId);
    if (!result) return null;
    const id = result.rowId ?? result.$id ?? result.id;
    return { ...result, rowId: id };
  }

  async getAllMasterPlaces() {
    return this.persistenceRepository.getMasterPlaces();
  }

  async upsert(place: MasterPlaceRecord, userId: string | number) {
    console.log("[bs] use-case::upsert", place, userId);
    return this.persistenceRepository.savePlaceAndSpot(place, userId);
  }

  async deleteSpot(rowId: string, userId: string) {
    console.log("[bs] use-case::deleteSpot", rowId);
    return this.persistenceRepository.deleteUserSpot(rowId, userId);
  }
}
