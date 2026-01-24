import { tablesDB, COLLECTIONS, DATABASE_ID, Query } from "$lib/the_clean/infrastructure/database/appwrite.client";


export const getSpotListByIdAdapter = async (userId: string) => {
  try {
    // const firstSpotList = await database.listDocuments({
    //   databaseId: DATABASE_ID,
    //   collectionId: COLLECTIONS.userPlaces,
    //   queries: [
    //     Query.equal('user_id', [userId]),
    //     Query.select(['*', `${COLLECTIONS.masterPlaces}.*`])
    //   ]
    // });

    // const spotList = firstSpotList
    console.log('[bs] adapter::TABLESDB', COLLECTIONS.masterPlaces)
    const spotList = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS.userPlaces,
      queries: [
        // Query.equal('place_id', firstSpotList.documents.map((doc) => doc.place_id)),
        Query.equal('user_id', [userId]),
        Query.select(['*', 'place_id.*'])
      ]
    });

      // const spotList = await database.listRows({
      //   databaseId: DATABASE_ID,
      //   // tableId: COLLECTIONS.userPlaces,
      //   tableId: COLLECTIONS.masterPlaces,
      //   queries: [
      //     Query.equal('places_user.user_id', [userId]),
      //     // Query.select(['place_id', `${COLLECTIONS.masterPlaces}.name`])
      //     // Query.select(['*', `${COLLECTIONS.masterPlaces}.*`])
      //   ]
      // });
      console.log('[bs] adapter:getSpotListById', spotList)
    return spotList;
  } catch (error) {
    console.error(error);
    return null;
  }
}
