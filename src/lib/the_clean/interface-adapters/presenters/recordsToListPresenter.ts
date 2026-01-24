import type { UserSpotRecord } from "$lib/the_clean/domain/Spot/ISpot";

interface DocumentList<T = Record<string, any>> {
  total?: number;
  documents?: T[];
  rows?: T[];
}


export function transformDocsToList(spots: DocumentList<any>) {
  const list = spots?.rows ?? spots?.documents ?? [];
  return list.map(convertAppwriteDocToSpot);
}

function convertAppwriteDocToSpot(doc: any) {
  // console.log('[bs] convertAppwriteDocToSpot::DOC', doc)
  const { place_id } = doc

  const spot : UserSpotRecord = {
    id: doc.$id,
    name: place_id.name,
    address: place_id.address,
    rating: place_id.rating,
    websiteURI: place_id.websiteURI,
    price_level: place_id.price_level,
    lat: place_id.lat,
    lng: place_id.lng,
    photos: place_id.photos,
    neighborhood: place_id.neighborhood,
    areas: place_id.areas ?? [],
    place_types: place_id.place_types ?? [],
    personal_rating: doc.personal_rating,
    personal_notes: doc.personal_notes,
    is_visited: doc.is_visited,
    user_id: doc.user_id,
    social_links: doc.social_links,
    notes: doc.notes,
    // createdAt: doc.$createdAt,
    // updatedAt: doc.$updatedAt,
    // permissions: doc.$permissions,
    place_id: doc.place_id.$id,
    // databaseId: doc.$databaseId,
    // collectionId: doc.$collectionId
  }
  console.log('convertAppwriteDocToSpot::SPOT', spot)
  return spot
}



const example = {
    "personal_rating": null,
    "personal_notes": null,
    "is_visited": null,
    "user_id": "665d17e8000fa5d7acca",
    "social_links": [],
    "$id": "67449ea7003c072de7e0",
    "$createdAt": "2024-11-25T15:58:32.230+00:00",
    "$updatedAt": "2024-11-25T15:58:32.230+00:00",
    "$permissions": [
        "read(\"user:665d17e8000fa5d7acca\")"
    ],
    "place_id": {
        "place_id": "ChIJxy0SM0xZwokR5vC0f4wVlP0",
        "address": "10 Lincoln Center Plaza, New York, NY 10023",
        "rating": 4.3,
        "websiteURI": "https://www.tatiananyc.com/",
        "price_level": "very_expensive",
        "lat": 40.7727862,
        "lng": -73.983104,
        "photos": [],
        "neighborhood": null,
        "name": "Tatiana by Kwame Onwuachi",
        "areas": [
            "New York",
            "NY",
            "10023"
        ],
        "place_types": [
            "restaurant",
            "food",
            "point_of_interest",
            "establishment"
        ],
        "$id": "ChIJxy0SM0xZwokR5vC0f4wVlP0",
        "$createdAt": "2024-11-21T06:31:17.427+00:00",
        "$updatedAt": "2024-11-25T15:59:04.817+00:00",
        "$permissions": [
            "read(\"any\")"
        ],
        "$databaseId": "bite_marks",
        "$collectionId": "66b02cb3001e8f0fa113"
    },
    "$databaseId": "bite_marks",
    "$collectionId": "places_user"
}
