import { z } from "zod";
import {
  MAX_LOCATION_NAME_LENGTH,
  MAX_RADIUS_MILES,
  MIN_RADIUS_MILES,
} from "./limits";

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const SavedLocationInputSchema = z.object({
  name: z.string().trim().min(1).max(MAX_LOCATION_NAME_LENGTH),
  lat: CoordinatesSchema.shape.lat,
  lng: CoordinatesSchema.shape.lng,
  radiusMiles: z.number().min(MIN_RADIUS_MILES).max(MAX_RADIUS_MILES),
});

export const SavedLocationSchema = SavedLocationInputSchema.extend({
  id: z.string(),
  isDefault: z.boolean(),
});

/** The location currently driving distances, the map, and search bias. */
export const ActiveLocationSchema = z.object({
  name: z.string().min(1),
  center: CoordinatesSchema,
  radiusMiles: z.number(),
  savedLocationId: z.string().nullable(),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type SavedLocationInput = z.infer<typeof SavedLocationInputSchema>;
export type SavedLocation = z.infer<typeof SavedLocationSchema>;
export type ActiveLocation = z.infer<typeof ActiveLocationSchema>;

export function clampRadiusMiles(radiusMiles: number): number {
  if (!Number.isFinite(radiusMiles)) return MAX_RADIUS_MILES;
  return Math.min(MAX_RADIUS_MILES, Math.max(MIN_RADIUS_MILES, radiusMiles));
}

export function findDefaultLocation(
  locations: readonly SavedLocation[],
): SavedLocation | null {
  return locations.find((location) => location.isDefault) ?? null;
}

export function activeLocationFromSaved(location: SavedLocation): ActiveLocation {
  return {
    name: location.name,
    center: { lat: location.lat, lng: location.lng },
    radiusMiles: location.radiusMiles,
    savedLocationId: location.id,
  };
}

/** Parses a cached active location, returning null for missing or corrupt values. */
export function parseActiveLocation(raw: string | null): ActiveLocation | null {
  if (!raw) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = ActiveLocationSchema.safeParse(json);
  if (!parsed.success) return null;
  return { ...parsed.data, radiusMiles: clampRadiusMiles(parsed.data.radiusMiles) };
}

/** The saved location whose radius no longer matches the active radius, if any. */
export function findSavedLocationWithChangedRadius(
  active: ActiveLocation,
  locations: readonly SavedLocation[],
): SavedLocation | null {
  if (!active.savedLocationId) return null;
  const saved = locations.find((location) => location.id === active.savedLocationId);
  if (!saved || saved.radiusMiles === active.radiusMiles) return null;
  return saved;
}
