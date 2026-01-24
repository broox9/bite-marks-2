import type { MasterPlaceRecord } from "$lib/core/domain/Place/Place";

export interface PlaceRepository {
  getPlaceById: (id: string) => Promise<MasterPlaceRecord | null>;
  getPlacesByUserId: (userId: string) => Promise<MasterPlaceRecord[]>;
  getAllPlaces: (query: string) => Promise<MasterPlaceRecord[]>;
}

