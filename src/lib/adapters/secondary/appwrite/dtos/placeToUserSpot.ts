import type { ResultPlaceRecord, MasterPlaceRecord } from "$lib/core/domain/Place/Place";
import type { UserSpotInput, UserSpotRecord } from "$lib/core/domain/Spot/Spot";

/**
 * Transforms a ResultPlaceRecord or MasterPlaceRecord into a UserSpotInput.
 * 
 * @param place - Either a ResultPlaceRecord or MasterPlaceRecord
 * @param userId - The user ID to associate with the spot (required)
 * @returns A UserSpotInput with the place_id from the place record and default values for other fields
 */
export function transformPlaceToUserSpot(
  place: ResultPlaceRecord | MasterPlaceRecord,
  userId: string
): Partial<UserSpotRecord> {
  console.log("[bs] adapter::transformPlaceToUserSpot", place, userId);
  return {
    place_id: [place.place_id],
    user_id: userId,
    name: place.name,
    personal_rating: null,
    personal_notes: null,
    is_visited: false,
    social_links: [],
  } as any;
}
