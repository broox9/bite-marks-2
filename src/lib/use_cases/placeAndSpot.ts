import type { MasterPlaceRecord } from "$lib/core/domain/Place/Place";
import type { UserSpotRecord } from "$lib/core/domain/Spot/Spot";
import type { PersistenceRepository } from "$lib/ports/persistence.repository";
import { transformAppwriteToUserSpotRecord } from "$lib/adapters/secondary/appwrite/dtos/appwriteToUserSpotRecord";

export class PlaceAndSpotUseCase {
  constructor(private persistenceRepository: PersistenceRepository) {}

  async getSpots(userId: string) {
    const result = await this.persistenceRepository.getUserSpots(userId);
    const { total, rows } = result as { total: number; rows: any[] };
    const spotRows = rows.map((result: any) => transformAppwriteToUserSpotRecord(result));
    return { total, rows: spotRows };
  }

  async getSpotByPlaceId(placeId: string, userId: string) {
    const result = await this.persistenceRepository.getUserSpot(placeId, userId);
    if (!result) return null;
    const spot = transformAppwriteToUserSpotRecord(result);
    return { ...spot, rowId: result.$id };
  }

  async updateSpot(rowId: string, data: Partial<UserSpotRecord>) {
    const result = await this.persistenceRepository.updateUserSpot(rowId, data);
    const spot = transformAppwriteToUserSpotRecord(result);
    return { ...spot, rowId: result.$id };
  }

  async getAllMasterPlaces() {
    return this.persistenceRepository.getMasterPlaces();
  }

  async upsert(place: MasterPlaceRecord, userId: string | number) {
    console.log("[bs] use-case::upsert", place, userId);
    // return this.persistenceRepository.saveMasterPlace(place, userId);
    return this.persistenceRepository.savePlaceAndSpot(place, userId);
  }
  async deleteSpot(rowId: string) {
    console.log("[bs] use-case::deleteSpot", rowId);
    return this.persistenceRepository.deleteUserSpot(rowId);
  }
}

