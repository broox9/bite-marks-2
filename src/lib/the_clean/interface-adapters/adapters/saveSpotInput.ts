import { database, COLLECTIONS, DATABASE_ID, ID, Query, Permission, Role } from "$lib/the_clean/infrastructure/database/appwrite.client";
import type { UserSpotInput } from "$lib/the_clean/domain/Spot/ISpot";
import type { MasterPlaceRecord, ResultPlaceRecord } from "$lib/the_clean/domain/Place/IPlace";
import {getCurrentUserAdapter} from  './getCurrentUser'

export const saveSpotInputAdapter = async ({spotInput, placeRecord}: {spotInput: UserSpotInput, placeRecord: ResultPlaceRecord}) => {
  console.log('[bs] adapter::SAVED SPOT', spotInput, placeRecord)

  let masterPlace : MasterPlaceRecord | null
  let spotCount : number

  // does the place exist?
  try{
    masterPlace = await findMasterPlace(placeRecord)
    if (!!masterPlace) {
      console.log('[bs] adapter::PLACE EXISTS', masterPlace)
    } else {
      masterPlace = await saveMasterPlace(placeRecord)
      console.log('[bs] adapter::NEW PLACE', masterPlace)
    }
  } catch (error) {
    console.error(error)
    return null
  }

  // does the spot exist?
  try{
    spotCount = await findUserSpot(spotInput)
    if (spotCount > 0) {
      console.log('[bs] adapter::SPOT EXISTS', spotCount)
      return null
    }
  } catch (error) {
    console.error(error)
  }

  // save the spot
  try {
    const { $id } = await getCurrentUserAdapter()
    const userSpotInput = {
      ...spotInput,
      user_id: $id
    }
    console.log('[bs] adapter::USER', $id)
    console.log('[bs] adapter::USERSPOTINPUT', userSpotInput)
    // return userSpotInput
    const spot = await database.createDocument(
      DATABASE_ID,
      COLLECTIONS.userPlaces,
      ID.unique(),
      userSpotInput,
          [
        Permission.read(Role.user($id)),    // Only this user can read
        Permission.update(Role.user($id)),  // Only this user can update
        Permission.delete(Role.user($id))   // Only this user can delete
    ]
    );
    return spot;
  } catch (error) {
    console.error(error);
    return null;
  }
}


async function findMasterPlace(placeRecord: ResultPlaceRecord) : Promise<MasterPlaceRecord | null> {
  try {
    const spot = await database.listDocuments(
      DATABASE_ID,
      COLLECTIONS.masterPlaces,
      [
        Query.equal('place_id', placeRecord.place_id)
      ]

    );
    return (spot.documents?.[0] ?? null) as unknown as MasterPlaceRecord | null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function findUserSpot(spotInput: UserSpotInput) : Promise<number> {
  try {
    const spot = await database.listDocuments(
      DATABASE_ID,
      COLLECTIONS.userPlaces,
      [
        Query.equal('place_id', spotInput.place_id)
      ]
    );
    return spot.total;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

async function saveMasterPlace(placeRecord: ResultPlaceRecord) {
  console.log('[bs] Save master place', placeRecord)
  try {
    const place = await database.createDocument(
      DATABASE_ID,
      COLLECTIONS.masterPlaces,
      ID.unique(),
      placeRecord
    );
    return place;
  } catch (error) {
    console.error(error);
    return null;
  }
}


// export interface Place {
//   place_id: string;      // required
//   address?: string;      // optional
//   rating?: number;       // double
//   websiteURI?: string;   // url
//   price_level?: string;  // enum
//   lat: number;           // required, double
//   lng: number;           // required, double
//   photos?: string[];     // array of urls
//   neighborhood?: string;
//   name: string;          // required
//   areas?: string[];      // array of strings
//   place_types?: string[]; // array of strings
// }
