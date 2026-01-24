/// <reference types="@types/google.maps" />
"use client";
import { locationStore as mapState } from "../stores/location.store.svelte";

// const mapState = $derived({
//     location: locationStore.center,
//     name: locationStore.name,
//     // bounds: {
//     //     east: -73.9,
//     //     west: -74.0,
//     //     north: 40.8,
//     //     south: 40.7
//     // },
//     getBounds() {
//         // return this.bounds
//         return {
//             east: this.location.lng - 0.03,//-74.1,
//             west: this.location.lng + 0.03,//-74.2,
//             north: this.location.lat + 0.04,//40.8,
//             south: this.location.lat - 0.04,//40.7
//         }
//     }
// })

type ResultHandler = (places: google.maps.places.PlaceResult[]) => void;

let google = $state(null);
let PlaceLib = $state(null);
const AREA_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "websiteURI",
  "location",
  "location",
  "addressComponents",
  "primaryType",
  "types"
]
const FIELDS = [
  ...AREA_FIELDS,
  "priceLevel",
  "rating",
  "photos",
  "businessStatus",
];

if (globalThis?.window) {
  google = window
    .resolveGoogleLoaded()
    .catch((e: Error) => {
      throw e;
    })
    .then(async (g) => {
      google = g;
      const { Place, SearchByTextRankPreference } = await google.maps.importLibrary("places");
      PlaceLib = Place;
    });
}


/**
 * @example Google Maps new Places search for stuff like "pizza in East Orange"
 * @param {Event} e - The search box input event
 * @param {ResultHandler} handleResults - The callback function to handle the result
 */
export async function searchForPlaces(text: string, handleResults: ResultHandler) {
  console.log("[bs] searchForPlaces", text);
  if (!text || text.length < 3) return;
  const request = {
    textQuery: text,
    fields: FIELDS,
    includedType: "restaurant",
    locationBias: locationStore.center,
    // isOpenNow: true,
    language: "en-US",
    maxResultCount: 8,
    minRating: 3.2,
    region: "us",
    useStrictTypeFiltering: false,
  };

  //@ts-ignore
  const { places } = await PlaceLib.searchByText(request);

  handleResults(places);
}


/**
 * @example Google Maps new Places search for stuff like "pizza in East Orange"
 * @param {Event} e - The search box input event
 * @param {ResultHandler} handleResults - The callback function to handle the result
 */
export async function searchForAreas(text: string, handleResults: ResultHandler) {
  console.log("[bs] searchForAreas", text);
  if (!text || text.length < 3) return;
  const { SearchByTextRankPreference } = await google.maps.importLibrary("places");
  const request = {
    textQuery: text,
    fields: AREA_FIELDS,
    language: "en-US",
    maxResultCount: 8,
    region: "us",
    useStrictTypeFiltering: false,
    includedType: 'locality',
    rankPreference: SearchByTextRankPreference.RELEVANCE
  };

  //@ts-ignore
  const { places } = await PlaceLib.searchByText(request);

  // let await google.maps.places.PlacesService.searchByText(placesService, request)
  handleResults(places);
}


/**
 * Google Maps new Autocomplete Search Request
 * @example - "Quality => [Quality Eats, Quality Bistro, Quality Italian]"
 * @param {string} value - The search box input value
 */
export async function placeAutoComplete(value: string) : Promise<google.maps.places.Place[] | []> {
  if (value.length < 3 || !google) return [];
  console.log(mapState.name, mapState.center, mapState.radiusMeters)
  // @ts-ignore
  const { Place, AutocompleteSessionToken, AutocompleteSuggestion } =
    (await google?.maps.importLibrary("places")) as google.maps.PlacesLibrary;

  // Add an initial request body.
  let request = {
    input: value,
    // locationRestriction: mapState.getBounds(), // east, west, north, south
    // origin: mapState.center, // lat, lng
    locationBias: {
      center: {...mapState.center}, // Example: Los Angeles coordinates
      radius: mapState.radiusMeters // Radius in meters (max 50,000 meters)
    },
    includedPrimaryTypes: ["restaurant", "bar", "pub", "bakery", "donut_shop"],
    language: "en-US",
    region: "us",
  };
  // Create a session token.
  const token = new AutocompleteSessionToken();

  // Add the token to the request.
  // @ts-ignore
  request.sessionToken = token;

  const { suggestions } =
    await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
  // console.log('[bs] SUGGESTIONS', suggestions)

  const places = [];
  for await (const sug of suggestions) {
    // console.log('[bs] place text', sug.placePrediction.text.toString())
    const place = sug.placePrediction.toPlace();
    await place.fetchFields({
      fields: FIELDS,
    });
    console.log('[bs] place fetched', place)
    places.push(place);
  }

  return places;
}


/**
 * Google Maps new Nearby Search Request
 * @param {Event} e - The search box input event
 * @param {ResultHandler} handleResults - The callback function to handle the result
 */
export async function nearbySearch(e: Event) {
  const value = e?.target?.value;
  console.log("[bs] nearbySearch value", value);
  if (value < 3) return; // oops this is nearby the set center
  // let center = new google.maps.LatLng(52.369358, 4.889258);
  let center = mapState.location;
  const { Place, SearchNearbyRankPreference } =
    (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;

  const request = {
    // required parameters
    fields: FIELDS,
    locationRestriction: {
      center,
      radius: 500,
    },
    // optional parameters
    includedPrimaryTypes: ["restaurant"],
    maxResultCount: 5,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
    language: "en-US",
    region: "us",
  };

  //@ts-ignore
  const { places } = await Place.searchNearby(request);
  console.log("[bs] NEARBY SEARCH", places);

  places.forEach((p) =>
    console.log(
      "[bs] place text",
      p.id,
      p.displayName,
      p.location,
      p.businessStatus,
    ),
  );

  return places
}


export async function getLocationByAddress(address: string) {
  const { Geocoder } = (await google?.maps.importLibrary("geocoding")) as google.maps.Geocoder;

  const geocode = (new Geocoder()).geocode
  const request = {
    address,
    region: 'us',
    language: 'en-US'
  }

  geocode(request, (results, status) => {
    console.log('[bs] GEOCODE:STATUS', status)
    console.log('[bs] GEOCODE:RESULTS', results)
  })
}
