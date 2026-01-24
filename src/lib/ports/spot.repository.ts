import type { UserSpotRecord } from "$lib/core/domain/Spot/Spot";

export interface SpotRepository {
  getSpotById: (id: string) => Promise<UserSpotRecord | null>;
  listSpotsByUserId: (userId: string) => Promise<UserSpotRecord[]>;
  upsertSpot: (spot: UserSpotRecord) => Promise<UserSpotRecord>;
}

