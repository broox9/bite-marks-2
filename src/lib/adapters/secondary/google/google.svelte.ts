/// <reference types="@types/google.maps" />
"use client";
import { locationStore as mapState } from "$lib/adapters/primary/stores/location.store.svelte";
import { importMapsLibrary, waitForGoogleMaps } from "./maps-loader";

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

type ResultHandler = (places: any[]) => void;

let google: any = $state(null);
let PlaceLib: any = $state(null);
export const MAX_PLACE_PHOTOS = 15;
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

async function ensureGooglePlaces(): Promise<{ google: any; Place: any } | null> {
  try {
    if (!google) {
      google = await waitForGoogleMaps();
    }
    if (!PlaceLib) {
      const { Place } = await importMapsLibrary<google.maps.PlacesLibrary>("places");
      PlaceLib = Place;
    }
    return { google, Place: PlaceLib };
  } catch (error) {
    console.error("[bs] Failed to initialize Google Maps Places", error);
    return null;
  }
}

if (globalThis?.window) {
  void ensureGooglePlaces();
}


/**
 * @example Google Maps new Places search for stuff like "pizza in East Orange"
 * @param {Event} e - The search box input event
 * @param {ResultHandler} handleResults - The callback function to handle the result
 */
export async function searchForPlaces(text: string, handleResults: ResultHandler) {
  console.log("[bs] searchForPlaces", text);
  if (!text || text.length < 3) return;
  const ready = await ensureGooglePlaces();
  if (!ready) return;
  const request = {
    textQuery: text,
    fields: FIELDS,
    includedType: "restaurant",
    locationBias: mapState.center,
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
  const ready = await ensureGooglePlaces();
  if (!ready) return;
  const { SearchByTextRankPreference } = await importMapsLibrary<google.maps.PlacesLibrary>("places");
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
  if (value.length < 3) return [];
  const ready = await ensureGooglePlaces();
  if (!ready) return [];
  console.log(mapState.name, mapState.center, mapState.radiusMeters)
  const { Place, AutocompleteSessionToken, AutocompleteSuggestion } =
    await importMapsLibrary<google.maps.PlacesLibrary>("places");

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
    if (!sug.placePrediction) continue;
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
  const value = (e?.target as HTMLInputElement | null)?.value;
  console.log("[bs] nearbySearch value", value);
  if (!value || value.length < 3) return; // oops this is nearby the set center
  const ready = await ensureGooglePlaces();
  if (!ready) return;
  // let center = new google.maps.LatLng(52.369358, 4.889258);
  let center = mapState.center;
  const { Place, SearchNearbyRankPreference } =
    await importMapsLibrary<google.maps.PlacesLibrary>("places");

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
  try {
    if (!google) {
      google = await waitForGoogleMaps();
    }
    const { Geocoder } = await importMapsLibrary<{ Geocoder: any }>("geocoding");

    const geocode = (new Geocoder()).geocode
    const request = {
      address,
      region: 'us',
      language: 'en-US'
    }

    geocode(request, (results: any, status: any) => {
      console.log('[bs] GEOCODE:STATUS', status)
      console.log('[bs] GEOCODE:RESULTS', results)
    })
  } catch (error) {
    console.error("[bs] Failed to load Google Maps geocoding", error);
  }
}


/**
 * Fetches photo URLs for a place by its place ID
 * @param placeId - The Google Place ID
 * @param maxHeight - Maximum height of the photo in pixels (default: 400)
 * @param maxWidth - Maximum width of the photo in pixels (optional)
 * @param maxPhotos - Maximum number of photos to return (default: 15)
 * @returns Photo URLs, or an empty array if no photos are available
 */
export async function getPlacePhotoUrls(
  placeId: string,
  maxHeight: number = 400,
  maxWidth?: number,
  maxPhotos: number = MAX_PLACE_PHOTOS,
): Promise<string[]> {
  const ready = await ensureGooglePlaces();
  if (!ready) return [];

  try {
    const { Place } = await importMapsLibrary<google.maps.PlacesLibrary>("places");
    
    // Create a Place instance with the place ID
    const place = new Place({ id: placeId });
    
    // Fetch only the photos field to minimize API costs
    await place.fetchFields({ fields: ['photos'] });
    
    // Check if photos exist
    if (!place.photos || place.photos.length === 0) {
      console.log('[bs] No photos found for place:', placeId);
      return [];
    }
    
    const photoOptions: google.maps.places.PhotoOptions = { maxHeight };
    if (maxWidth) {
      photoOptions.maxWidth = maxWidth;
    }
    
    const photoLimit = Math.min(Math.max(maxPhotos, 0), MAX_PLACE_PHOTOS);

    return place.photos
      .slice(0, photoLimit)
      .map((photo) => photo.getURI(photoOptions));
  } catch (error) {
    console.error('[bs] Error fetching place photos:', error);
    return [];
  }
}

/**
 * Fetches a photo URL for a place by its place ID
 * @param placeId - The Google Place ID
 * @param maxHeight - Maximum height of the photo in pixels (default: 400)
 * @param maxWidth - Maximum width of the photo in pixels (optional)
 * @returns The photo URL or null if no photo is available
 */
export async function getPlacePhotoUrl(
  placeId: string,
  maxHeight: number = 400,
  maxWidth?: number
): Promise<string | null> {
  const photos = await getPlacePhotoUrls(placeId, maxHeight, maxWidth, 1);
  return photos[0] ?? null;
}
