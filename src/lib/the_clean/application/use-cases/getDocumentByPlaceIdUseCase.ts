import { database, COLLECTIONS, DATABASE_ID, Query } from "$lib/the_clean/infrastructure/database/appwrite.client";

export const getDocumentByPlaceIdUseCase = async (placeId: string) => {
  try {
    const spot = await database.listDocuments(
      DATABASE_ID,
      COLLECTIONS.userPlaces,
      [
        Query.equal('place_id', placeId)
      ]
    );
    return spot;
  } catch (error) {
    console.error(error);
    return null;
  }
}