import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";

// NOTE: This adapter runs in server-side contexts as well; avoid relying on `google.maps.*` typings.
export function transformResultToPlace(placeResult: any): ResultPlaceRecord {
  console.log("[bs] transformResultToPlace", placeResult);
  const {
    id,
    place_id,
    name,
    address,
    displayName,
    formattedAddress,
    rating,
    websiteURI,
    priceLevel,
    price_level,
    location,
    lat,
    lng,
    addressComponents,
    types,
    place_types,
    primaryType,
  } = placeResult;

  // Google Places "displayName" can be either a string or an object like { text, languageCode }
  // @TODO: Review the logic and necessecity of this normalization.
  const normalizedName =
    (typeof displayName === "string" ? displayName : displayName?.text) ?? name ?? "";
  const normalizedAddress = formattedAddress ?? address ?? "";
  const normalizedPlaceId = id ?? place_id ?? "";
  const normalizedPriceLevel = normalizePriceLevel(priceLevel ?? price_level);
  const normalizedTypes = Array.isArray(types) ? types : Array.isArray(place_types) ? place_types : [];
  const normalizedLat = lat ?? location?.lat?.() ?? location?.lat ?? 0;
  const normalizedLng = lng ?? location?.lng?.() ?? location?.lng ?? 0;

  let neighborhood = "";
  const areas: any[] = [];

  if (addressComponents) {
    addressComponents.forEach((c: any) => {
      c.types.forEach((t: string) => {
        if (t === "sublocality") neighborhood = c.shortText;
        if (t === "neighborhood") neighborhood = c.shortText;
        if (t === "sublocality_level_1") areas.push(c.shortText);
        if (t === "administrative_area_1") areas.push(c.shortText);
        if (t === "postal_code") areas.push(c.shortText);
      });
    });
  }

  // If the incoming payload already has these populated (e.g. saved spot records), prefer them.
  if (typeof placeResult?.neighborhood === "string" && placeResult.neighborhood.length > 0) {
    neighborhood = placeResult.neighborhood;
  }
  const inputAreas = Array.isArray(placeResult?.areas) ? placeResult.areas : null;

  const placeRecord: ResultPlaceRecord = {
    place_id: normalizedPlaceId,
    name: normalizedName,
    address: normalizedAddress,
    rating: rating,
    websiteURI: websiteURI,
    price_level: normalizedPriceLevel,
    lat: normalizedLat,
    lng: normalizedLng,
    photos: [], // place.photos,
    neighborhood: neighborhood,
    place_types: normalizedTypes.slice(0, -2).map((t: string) => t.replace(/_/g, " ")) || [],
    areas: inputAreas ?? areas,
    primaryType,
  };

  return placeRecord;
}

// @TODO: Review the complexity of this function
function normalizePriceLevel(value: unknown): "free" | "inexpensive" | "moderate" | "expensive" | "very_expensive" {
  if (typeof value === "string") {
    const v = value.trim();
    // already-normalized
    if (v === "free" || v === "inexpensive" || v === "moderate" || v === "expensive" || v === "very_expensive") {
      return v;
    }
    // Google Places can return enum-like strings e.g. PRICE_LEVEL_EXPENSIVE
    const upper = v.toUpperCase();
    if (upper.includes("FREE")) return "free";
    if (upper.includes("INEXPENSIVE") || upper.includes("CHEAP")) return "inexpensive";
    if (upper.includes("MODERATE") || upper.includes("MEDIUM")) return "moderate";
    if (upper.includes("VERY_EXPENSIVE")) return "very_expensive";
    if (upper.includes("EXPENSIVE")) return "expensive";
  }

  // Some APIs use numeric tiers; map defensively.
  if (typeof value === "number" && Number.isFinite(value)) {
    const n = Math.round(value);
    if (n <= 0) return "free";
    if (n === 1) return "inexpensive";
    if (n === 2) return "moderate";
    if (n === 3) return "expensive";
    return "very_expensive";
  }

  // Default when no price info is available.
  return "free";
}

