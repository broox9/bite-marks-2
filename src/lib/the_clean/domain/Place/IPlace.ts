export interface MasterPlaceRecord {
  id: string;
  place_id: string;
  name: string;
  address: string;
  rating: number | undefined;
  websiteURI: string;
  price_level: string;
  lat: number;
  lng: number;
  photos: any; // Consider specifying a more precise type if possible
  neighborhood: string;
  areas: string[];
  place_types: string[] | [];
}

export type ResultPlaceRecord = Omit<MasterPlaceRecord, 'id'>

/* 
Google Places Data Fiels
https://developers.google.com/maps/documentation/places/web-service/data-fields
Google Places Place Types
https://developers.google.com/maps/documentation/places/web-service/place-types

*/


const appwriteDocExample = {
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