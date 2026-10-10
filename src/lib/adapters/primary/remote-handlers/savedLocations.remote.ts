import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { z } from "zod";

import { SavedLocationInputSchema } from "$lib/core/domain/Location/Location";
import { getSavedLocationRepository } from "$lib/glue/di-container";

// `userId` only scopes the client-side query cache per account; the server
// still authorizes from `locals.user` and rejects a mismatched id.
const listSchema = z.object({ userId: z.string().min(1) });
const locationIdSchema = z.string().min(1);
const updateSchema = z.object({
  id: locationIdSchema,
  patch: SavedLocationInputSchema.partial(),
});

function requireUser() {
  const user = getRequestEvent().locals.user;
  if (!user) throw error(401, "Unauthorized");
  return user;
}

export const listSavedLocations = query(listSchema, async ({ userId }) => {
  const user = requireUser();
  if (userId !== user.id) throw error(403, "Forbidden");
  return await getSavedLocationRepository().list(user.id);
});

export const createSavedLocation = command(SavedLocationInputSchema, async (input) => {
  const user = requireUser();
  return await getSavedLocationRepository().create(user.id, input);
});

export const updateSavedLocation = command(updateSchema, async ({ id, patch }) => {
  const user = requireUser();
  const location = await getSavedLocationRepository().update(user.id, id, patch);
  if (!location) throw error(404, "Location not found");
  return location;
});

export const setDefaultSavedLocation = command(locationIdSchema, async (id) => {
  const user = requireUser();
  const location = await getSavedLocationRepository().setDefault(user.id, id);
  if (!location) throw error(404, "Location not found");
  return location;
});

export const deleteSavedLocation = command(locationIdSchema, async (id) => {
  const user = requireUser();
  const removed = await getSavedLocationRepository().remove(user.id, id);
  if (!removed) throw error(404, "Location not found");
  return { success: true };
});
