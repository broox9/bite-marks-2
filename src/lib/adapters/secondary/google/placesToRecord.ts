import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";

// This mapper runs in server-side contexts as well; avoid relying on `google.maps.*` typings.
export function transformResultToPlace(placeResult: any): ResultPlaceRecord {
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

  const normalizedName =
    (typeof displayName === "string" ? displayName : displayName?.text) ?? name ?? "";
  const normalizedAddress = formattedAddress ?? address ?? "";
  const normalizedPlaceId = id ?? place_id ?? "";
  const normalizedPriceLevel = normalizePriceLevel(priceLevel ?? price_level);
  const normalizedTypes = Array.isArray(types)
    ? types
    : Array.isArray(place_types)
      ? place_types
      : [];
  const normalizedLat = lat ?? location?.lat?.() ?? location?.lat ?? 0;
  const normalizedLng = lng ?? location?.lng?.() ?? location?.lng ?? 0;

  let neighborhood = "";
  const areas: string[] = [];

  if (addressComponents) {
    addressComponents.forEach((component: any) => {
      component.types.forEach((type: string) => {
        if (
          type === "sublocality" ||
          type === "neighborhood" ||
          type === "sublocality_level_1"
        ) {
          neighborhood = component.shortText;
        }
        if (
          type === "sublocality_level_1" ||
          type === "administrative_area_1" ||
          type === "postal_code"
        ) {
          areas.push(component.shortText);
        }
      });
    });
  }

  if (typeof placeResult?.neighborhood === "string" && placeResult.neighborhood.length > 0) {
    neighborhood = placeResult.neighborhood;
  }
  const inputAreas = Array.isArray(placeResult?.areas) ? placeResult.areas : null;

  return {
    place_id: normalizedPlaceId,
    name: normalizedName,
    address: normalizedAddress,
    rating,
    websiteURI: websiteURI || null,
    price_level: normalizedPriceLevel,
    lat: normalizedLat,
    lng: normalizedLng,
    photos: [],
    neighborhood,
    place_types: normalizedTypes.slice(0, -2).map((type: string) => type.replace(/_/g, " ")),
    areas: inputAreas ?? areas,
    primaryType,
  };
}

function normalizePriceLevel(
  value: unknown,
): "free" | "inexpensive" | "moderate" | "expensive" | "very_expensive" {
  if (typeof value === "string") {
    const normalized = value.trim();
    if (
      normalized === "free" ||
      normalized === "inexpensive" ||
      normalized === "moderate" ||
      normalized === "expensive" ||
      normalized === "very_expensive"
    ) {
      return normalized;
    }

    const upper = normalized.toUpperCase();
    if (upper.includes("FREE")) return "free";
    if (upper.includes("INEXPENSIVE") || upper.includes("CHEAP")) return "inexpensive";
    if (upper.includes("MODERATE") || upper.includes("MEDIUM")) return "moderate";
    if (upper.includes("VERY_EXPENSIVE")) return "very_expensive";
    if (upper.includes("EXPENSIVE")) return "expensive";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = Math.round(value);
    if (normalized <= 0) return "free";
    if (normalized === 1) return "inexpensive";
    if (normalized === 2) return "moderate";
    if (normalized === 3) return "expensive";
    return "very_expensive";
  }

  return "free";
}
