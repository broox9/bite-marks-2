import type { UserSpotRecord } from "$lib/core/domain/Spot/Spot";

/**
 * Transforms an Appwrite document/row result into a UserSpotRecord.
 * 
 * Expects the Appwrite result to have the place_id relationship expanded
 * (e.g., using Query.select(['*', 'place_id.*'])).
 * 
 * @param appwriteDoc - The Appwrite document/row from userPlaces table with expanded place_id relationship
 * @returns A UserSpotRecord combining spot data and place data
 */
export function transformAppwriteToUserSpotRecord(appwriteDoc: any): UserSpotRecord {
  const { place_id } = appwriteDoc;

  // Handle case where place_id might be an array (relationship) or already expanded object
  const place = Array.isArray(place_id) ? place_id[0] : place_id;

  return {
    // Spot fields from UserSpotInput
    id: appwriteDoc.$id,
    name: appwriteDoc.name ?? place?.name ?? "",
    personal_rating: appwriteDoc.personal_rating ?? null,
    personal_notes: appwriteDoc.personal_notes ?? null,
    is_visited: appwriteDoc.is_visited ?? false,
    user_id: appwriteDoc.user_id,
    place_id: place?.$id ?? place?.place_id ?? appwriteDoc.place_id,
    social_links: Array.isArray(appwriteDoc.social_links) ? appwriteDoc.social_links : [],

    // Place fields from MasterPlaceRecord
    // id: place?.$id ?? place?.place_id ?? appwriteDoc.place_id,
    address: place?.address ?? "",
    rating: place?.rating,
    websiteURI: place?.websiteURI ?? "",
    price_level: place?.price_level ?? "free",
    lat: place?.lat ?? 0,
    lng: place?.lng ?? 0,
    photos: place?.photos ?? [],
    neighborhood: place?.neighborhood ?? "",
    areas: Array.isArray(place?.areas) ? place.areas : [],
    place_types: Array.isArray(place?.place_types) ? place.place_types : [],
    primaryType: place?.primaryType,
  };
}
