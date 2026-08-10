import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { z } from "zod";

import { ResultPlaceRecordSchema } from "$lib/core/domain/Place/Place";
import { getPlaceAndSpotUseCase } from "$lib/glue/di-container";

const spotsSchema = z.object({});

const deleteSpotSchema = z.string();

const getSpotByIdSchema = z.object({
  id: z.string(),
});

const saveSpotSchema = z.object({
  spot: ResultPlaceRecordSchema,
});

const updateSpotSchema = z.object({
  rowId: z.string(),
  data: z.object({
    personal_rating: z.number().nullable().optional(),
    personal_notes: z.string().nullable().optional(),
    is_visited: z.boolean().optional(),
    social_links: z.array(z.string()).optional(),
  }),
});

export const getSpots = query(spotsSchema, async () => {
  const event = getRequestEvent();
  const user = event.locals.user;
  if (!user) throw error(401, "Unauthorized");

  const spots = await getPlaceAndSpotUseCase().getSpots(user.id);
  return spots;
});

export const getSpotById = query(
  getSpotByIdSchema,
  async ({ id }: z.infer<typeof getSpotByIdSchema>) => {
    const event = getRequestEvent();
    const user = event.locals.user;
    if (!user) throw error(401, "Unauthorized");

    console.log("[bs] spots::remote::getSpotById", id);
    const spot = await getPlaceAndSpotUseCase().getSpotByPlaceId(id, user.id);
    return spot;
  }
);

export const updateSpot = command(
  updateSpotSchema,
  async ({ rowId, data }: z.infer<typeof updateSpotSchema>) => {
    const event = getRequestEvent();
    const user = event.locals.user;
    if (!user) throw error(401, "Unauthorized");

    console.log("[bs] spots::remote::updateSpot", rowId, data);
    const updatedSpot = await getPlaceAndSpotUseCase().updateSpot(rowId, data, user.id);
    if (!updatedSpot) throw error(404, "Spot not found");
    return updatedSpot;
  }
);

export const saveSpot = command(saveSpotSchema, async ({ spot }: z.infer<typeof saveSpotSchema>) => {
  const event = getRequestEvent();
  const user = event.locals.user;
  if (!user) throw error(401, "Unauthorized");

  console.log("[bs] spots::remote::saveSpot", spot);

  // `ResultPlaceRecordSchema` lacks `id`; the current use-case expects a master place record.
  const place = { id: spot.place_id, ...spot } as any;

  const savedSpot = await getPlaceAndSpotUseCase().upsert(place, user.id);
  return savedSpot;
});

export const deleteUserSpot = command(deleteSpotSchema, async (rowId : string) => {
    const event = getRequestEvent();
    const user = event.locals.user;
    if (!user) throw error(401, "Unauthorized");

    console.log("[bs] spots::remote::deleteUserSpot", rowId);
    const deletedSpot = await getPlaceAndSpotUseCase().deleteSpot(rowId, user.id);
    return deletedSpot;
  }
);

