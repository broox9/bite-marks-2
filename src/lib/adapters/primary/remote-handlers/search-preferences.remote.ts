import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { z } from "zod";
import { createConvexHttpClient } from "@mmailaender/convex-better-auth-svelte/sveltekit";
import { api } from "$convex/_generated/api";

const METERS_PER_MILE = 1609.344;

const getSearchPreferencesSchema = z.object({});
const saveSearchPreferencesSchema = z.object({
  locationName: z.string().trim().min(1).max(120),
  center: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  radiusMiles: z.number().min(1).max(30),
  type: z.string().trim().max(40).optional(),
});

function toClientPreference(
  preference: {
    locationName: string;
    center: { lat: number; lng: number };
    radiusMeters: number;
    type?: string;
  } | null,
) {
  if (!preference) return null;
  return {
    locationName: preference.locationName,
    center: preference.center,
    radiusMiles: Math.round((preference.radiusMeters / METERS_PER_MILE) * 10) / 10,
    type: preference.type,
  };
}

export const getSearchPreferences = query(getSearchPreferencesSchema, async () => {
  const event = getRequestEvent();
  if (!event.locals.user) throw error(401, "Unauthorized");

  const client = createConvexHttpClient();
  const preference = await client.query(api.searchPreferences.getMine, {});
  return toClientPreference(preference);
});

export const saveSearchPreferences = command(
  saveSearchPreferencesSchema,
  async ({ radiusMiles, type, ...preference }) => {
    const event = getRequestEvent();
    if (!event.locals.user) throw error(401, "Unauthorized");

    const client = createConvexHttpClient();
    const saved = await client.mutation(api.searchPreferences.upsertMine, {
      ...preference,
      radiusMeters: radiusMiles * METERS_PER_MILE,
      type: type || undefined,
    });
    return toClientPreference(saved);
  },
);
