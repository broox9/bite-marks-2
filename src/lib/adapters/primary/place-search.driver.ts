import { placeAutoComplete } from "$lib/adapters/secondary/google/google.svelte";
import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";

type SearchType = "places" | "nearby";

export type ResultListParams = {
  value: string;
  type: SearchType;
  callback: (spots: ResultPlaceRecord[]) => void;
};

/**
 * Primary driver for client-side place search orchestration.
 * Calls the Google secondary adapter and maps results into domain records.
 */
export async function resultsListController({ value, callback }: ResultListParams) {
  try {
    const places = await placeAutoComplete(value);
    const list = places.map(transformGooglePlaceToResultPlaceRecord);
    callback(list);
  } catch (error) {
    console.error(error);
    callback([]);
  }
}

function transformGooglePlaceToResultPlaceRecord(place: any): ResultPlaceRecord {
  const id: string = String(place?.id ?? "");
  const displayName: string =
    typeof place?.displayName === "string" ? place.displayName : String(place?.displayName?.text ?? "");
  const formattedAddress: string = String(place?.formattedAddress ?? "");

  const rating: number | undefined = typeof place?.rating === "number" ? place.rating : undefined;
  const websiteURI: string = String(place?.websiteURI ?? "");
  const price_level: string = String(place?.priceLevel ?? "");

  const location = place?.location;
  const lat =
    typeof location?.lat === "function"
      ? location.lat()
      : Number.isFinite(location?.lat)
        ? location.lat
        : Number(location?.lat ?? 0);
  const lng =
    typeof location?.lng === "function"
      ? location.lng()
      : Number.isFinite(location?.lng)
        ? location.lng
        : Number(location?.lng ?? 0);

  const addressComponents = Array.isArray(place?.addressComponents) ? place.addressComponents : [];
  let neighborhood = "";
  const areas: string[] = [];

  for (const c of addressComponents as any[]) {
    const shortText = String(c?.shortText ?? "");
    const types: string[] = Array.isArray(c?.types) ? c.types : [];
    for (const t of types) {
      if (t === "sublocality" || t === "neighborhood") neighborhood = shortText;
      if (t === "sublocality_level_1" || t === "administrative_area_1" || t === "postal_code") {
        if (shortText) areas.push(shortText);
      }
    }
  }

  const typesRaw: string[] = Array.isArray(place?.types) ? place.types : [];
  const place_types = typesRaw.slice(0, -2).map((t) => String(t).replace(/_/g, " "));

  return {
    place_id: id,
    name: displayName,
    address: formattedAddress,
    rating,
    websiteURI,
    price_level,
    lat,
    lng,
    photos: [],
    neighborhood,
    areas,
    place_types,
  };
}

