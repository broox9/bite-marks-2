import { listSpotsByUser } from "../use-cases/listSpotsByUserUseCase";
import { transformDocsToList } from "../../interface-adapters/presenters/recordsToListPresenter";
import { getSpotListByIdAdapter } from "$lib/the_clean/interface-adapters/adapters/getSpotListById";
import { getDocumentByPlaceIdUseCase } from "../use-cases/getDocumentByPlaceIdUseCase";

interface SpotsPageListParams {
  userId: string;
  resultCallback: (spots: any[]) => void;
}

export async function spotsPageList({ userId, resultCallback }: SpotsPageListParams) {
  try {
    const spots = await listSpotsByUser({ userId, getListAdapter: getSpotListByIdAdapter, presenter: transformDocsToList })
    // const spots = await Promise.resolve(mockResponse())
    console.log('[bs] controller:spots', spots)
    resultCallback(spots)
  } catch (error) {
    console.error(error)
    resultCallback([])
  }
}

export async function findSpotById({ spotId, resultCallback }: { spotId: string; resultCallback: (spot: any) => void }) {
  try {
    const result = await getDocumentByPlaceIdUseCase(spotId);
    console.log('[bs] controller::findSpotById::result', result)
    if (result && result.documents.length > 0) {
      resultCallback(result.documents[0]);
    } else {
      resultCallback(null);
    }
  } catch (error) {
    console.error(error);
    resultCallback(null);
  }
}


function mockResponse() {
  return [
      {
          "id": "67449ea7003c072de7e0",
          "name": "Tatiana by Kwame Onwuachi",
          "address": "10 Lincoln Center Plaza, New York, NY 10023",
          "rating": 4.3,
          "websiteURI": "https://www.tatiananyc.com/",
          "price_level": "very_expensive",
          "lat": 40.7727862,
          "lng": -73.983104,
          "photos": [],
          "neighborhood": null,
          "place_types": [
              "restaurant",
              "food",
              "point_of_interest",
              "establishment"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": null,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "ChIJxy0SM0xZwokR5vC0f4wVlP0"
      },
      {
          "id": "67449eec002c598d9ab8",
          "name": "Beefbar New York",
          "address": "105 Hudson St, New York, NY 10013",
          "rating": 4.6,
          "websiteURI": "https://beefbar.com/new-york/",
          "price_level": null,
          "lat": 40.719584,
          "lng": -74.0088579,
          "photos": [],
          "neighborhood": null,
          "place_types": [
              "restaurant",
              "point_of_interest",
              "food",
              "establishment"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": null,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "ChIJKz8I-lpZwokRHwAtAIZu8Ng"
      },
      {
          "id": "67449f2b002a23b33132",
          "name": "Bad Roman",
          "address": "3rd floor, 10 Columbus Cir, New York, NY 10019",
          "rating": 4.1,
          "websiteURI": "https://www.badromannyc.com/",
          "price_level": null,
          "lat": 40.7685526,
          "lng": -73.9831866,
          "photos": [],
          "neighborhood": null,
          "place_types": [
              "italian_restaurant",
              "bar",
              "restaurant",
              "food",
              "point_of_interest",
              "establishment"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": null,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "ChIJG0fkfuJZwokRqmAxXTpYP2I"
      },
      {
          "id": "6744a31f0019557972d6",
          "name": "Emilio's Ballato",
          "address": "55 E Houston St, New York, NY 10012",
          "rating": 4.2,
          "websiteURI": "https://www.emiliosballato.com/",
          "price_level": "expensive",
          "lat": 40.7245528,
          "lng": -73.9945038,
          "photos": [],
          "neighborhood": null,
          "place_types": [
              "italian_restaurant",
              "bar",
              "restaurant",
              "point_of_interest",
              "food",
              "establishment"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": null,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "ChIJRQqJgYVZwokRfJB16sxh1Pg"
      },
      {
          "id": "6744b4a9000445f8c72d",
          "name": "Carbone New York",
          "address": "181 Thompson St, New York, NY 10012",
          "rating": 4.3,
          "websiteURI": "https://www.carbonenewyork.com/?utm_medium=Click&utm_source=GoogleMyBusiness",
          "price_level": "very_expensive",
          "lat": 40.7279891,
          "lng": -74.0002414,
          "photos": [],
          "neighborhood": null,
          "place_types": [
              "italian_restaurant",
              "restaurant",
              "food",
              "point_of_interest",
              "establishment"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": null,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "ChIJmSvG_ZFZwokRTOFeiLXzkmA"
      },
      {
          "id": "6748bb7f0021fb796881",
          "name": "4 Charles Prime Rib",
          "address": "4 Charles St #3004, New York, NY 10014",
          "rating": 4.7,
          "websiteURI": "https://nycprimerib.com/",
          "price_level": "expensive",
          "lat": 40.7351675,
          "lng": -74.0006537,
          "photos": [],
          "neighborhood": null,
          "place_types": [
              "steak_house",
              "restaurant",
              "food",
              "point_of_interest",
              "establishment"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": null,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "ChIJ-7AOKpRZwokRMq0XnG_eehU"
      },
      {
          "id": "674a0efb002b41d347a4",
          "name": "pastaRAMEN",
          "address": "6 S Fullerton Ave, Montclair, NJ 07042",
          "rating": 4.2,
          "websiteURI": "https://www.pastaramen.com/",
          "price_level": "moderate",
          "lat": 40.8135267,
          "lng": -74.217865,
          "photos": [],
          "neighborhood": null,
          "place_types": [
              "restaurant",
              "asian_restaurant",
              "italian_restaurant",
              "japanese_restaurant",
              "food",
              "point_of_interest",
              "establishment"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": null,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "ChIJHYBuT51VwokRUPwbQba-6wU"
      },
      {
          "id": "68566b0c003cb777a375",
          "name": "Fish Cheeks",
          "address": "55 Bond St, New York, NY 10012",
          "rating": 4.8,
          "websiteURI": "https://www.fishcheeksnyc.com/",
          "price_level": "moderate",
          "lat": 40.7256763,
          "lng": -73.9926822,
          "photos": [],
          "neighborhood": "Manhattan",
          "place_types": [
              "thai restaurant",
              "seafood restaurant",
              "restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "68566555003151edf20c"
      },
      {
          "id": "68566c26000a12f93dba",
          "name": "C as in Charlie",
          "address": "5 Bleecker St, New York, NY 10012",
          "rating": 4.8,
          "websiteURI": "http://c-asincharlie.com/",
          "price_level": "moderate",
          "lat": 40.7255039,
          "lng": -73.9927018,
          "photos": [],
          "neighborhood": "Manhattan",
          "place_types": [
              "korean restaurant",
              "asian restaurant",
              "restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "68566b87001d51f253cb"
      },
      {
          "id": "68566ce6000c7a3d31a4",
          "name": "Rezdôra",
          "address": "27 E 20th St, New York, NY 10003",
          "rating": 4.2,
          "websiteURI": "https://www.rezdora.nyc/",
          "price_level": null,
          "lat": 40.739083,
          "lng": -73.989044,
          "photos": [],
          "neighborhood": "Manhattan",
          "place_types": [
              "italian restaurant",
              "fine dining restaurant",
              "restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "68566ce4003e3afda7b8"
      },
      {
          "id": "6858dea0001384566d84",
          "name": "Mark's Off Madison",
          "address": "41 Madison Ave Ground Level, New York, NY 10010",
          "rating": 4,
          "websiteURI": "https://www.marksoffmadison.com/",
          "price_level": "moderate",
          "lat": 40.7423278,
          "lng": -73.9862644,
          "photos": [],
          "neighborhood": "Manhattan",
          "place_types": [
              "italian restaurant",
              "brunch restaurant",
              "restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "6858de9f0021ed9d3da5"
      },
      {
          "id": "6858dfa8003a642d7d35",
          "name": "Las' Lap",
          "address": "74 Orchard St, New York, NY 10002",
          "rating": 4.1,
          "websiteURI": "http://www.laslapnewyork.com/",
          "price_level": "moderate",
          "lat": 40.7176139,
          "lng": -73.9902341,
          "photos": [],
          "neighborhood": "Manhattan",
          "place_types": [
              "bar",
              "restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "6858dfa80008d060c75a"
      },
      {
          "id": "6858e1c9000f0dfc0f0d",
          "name": "S'Aimer - NYC",
          "address": "338 W 46th St, New York, NY 10036",
          "rating": 4.6,
          "websiteURI": "https://saimernyc.com/",
          "price_level": null,
          "lat": 40.7601989,
          "lng": -73.989511,
          "photos": [],
          "neighborhood": "Manhattan",
          "place_types": [
              "bar",
              "night club",
              "restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "6858e1c8001e8f0bd3d9"
      },
      {
          "id": "6858e22300392e11aeca",
          "name": "Cecconi's",
          "address": "55 Water St, Brooklyn, NY 11201",
          "rating": 4.1,
          "websiteURI": "http://cecconisdumbo.com/?utm_source=google&utm_medium=organic&utm_campaign=googlemybusiness",
          "price_level": "moderate",
          "lat": 40.7038391,
          "lng": -73.9914621,
          "photos": [],
          "neighborhood": "Brooklyn",
          "place_types": [
              "restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "6858e222002f0bcb1f76"
      },
      {
          "id": "6858e29c000069615969",
          "name": "Fushimi Times Square",
          "address": "311 W 43rd St, New York, NY 10036",
          "rating": 4.6,
          "websiteURI": "https://fushimi.nyc/",
          "price_level": "moderate",
          "lat": 40.7584564,
          "lng": -73.9900329,
          "photos": [],
          "neighborhood": "Manhattan",
          "place_types": [
              "restaurant",
              "sushi restaurant",
              "steak house",
              "vegetarian restaurant",
              "seafood restaurant",
              "asian restaurant",
              "japanese restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "6858e29b000de49f770b"
      },
      {
          "id": "6858e2e40039d14864f5",
          "name": "Fushimi Williamsburg",
          "address": "475 Driggs Ave, Brooklyn, NY 11211",
          "rating": 4.4,
          "websiteURI": "https://fushimiwilliamsburg.com/",
          "price_level": "moderate",
          "lat": 40.7187868,
          "lng": -73.9543275,
          "photos": [],
          "neighborhood": "Brooklyn",
          "place_types": [
              "restaurant",
              "steak house",
              "vegetarian restaurant",
              "seafood restaurant",
              "asian restaurant",
              "sushi restaurant",
              "japanese restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "6858e2e4000b18ff578c"
      },
      {
          "id": "6858e49c003bd17de081",
          "name": "Nobu Fifty Seven",
          "address": "40 W 57th St, New York, NY 10019",
          "rating": 4.4,
          "websiteURI": "https://www.noburestaurants.com/fifty-seven/home/?utm_source=google&utm_medium=Yext",
          "price_level": "very_expensive",
          "lat": 40.763705,
          "lng": -73.9762452,
          "photos": [],
          "neighborhood": null,
          "place_types": [
              "restaurant",
              "bar",
              "point_of_interest",
              "food",
              "establishment"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "ChIJPX5iCfpYwokRACnACAf2pJw"
      },
      {
          "id": "6864d640000ecbe5b2ed",
          "name": "The Donut Pub",
          "address": "740 Broadway, New York, NY 10003",
          "rating": 4.4,
          "websiteURI": "https://www.donutpub.com/location/astor-place/",
          "price_level": "moderate",
          "lat": 40.7297984,
          "lng": -73.9928956,
          "photos": [],
          "neighborhood": "Manhattan",
          "place_types": [
              "donut shop",
              "vegan restaurant",
              "vegetarian restaurant",
              "bakery",
              "food store",
              "store",
              "restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "6864d63f00207450471a"
      },
      {
          "id": "6864d72500274ab37e9a",
          "name": "Toscana Brentwood",
          "address": "11633 San Vicente Blvd # 100, Los Angeles, CA 90049",
          "rating": 4.3,
          "websiteURI": "http://www.toscanabrentwood.com/",
          "price_level": "expensive",
          "lat": 34.0541909,
          "lng": -118.4631879,
          "photos": [],
          "neighborhood": "Brentwood",
          "place_types": [
              "italian restaurant",
              "pizza restaurant",
              "fine dining restaurant",
              "restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "6864d724003936dde91d"
      },
      {
          "id": "6864d8b5001374310fea",
          "name": "7 Doors Down Eatary",
          "address": "271-273 Glenwood Ave, Bloomfield, NJ 07003",
          "rating": 4.5,
          "websiteURI": "http://7doorsdown.com/",
          "price_level": "moderate",
          "lat": 40.7919852,
          "lng": -74.1990275,
          "photos": [],
          "neighborhood": "",
          "place_types": [
              "ramen restaurant",
              "pizza restaurant",
              "japanese restaurant",
              "restaurant",
              "food"
          ],
          "personal_rating": null,
          "personal_notes": null,
          "is_visited": false,
          "user_id": "665d17e8000fa5d7acca",
          "social_links": [],
          "place_id": "6864d8b40023e7119633"
      }
  ]
}
