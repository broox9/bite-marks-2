import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { z } from "zod";

import { ResultPlaceRecordSchema } from "$lib/core/domain/Place/Place";
import { placeAndSpotUseCase } from "$lib/glue/di-container";

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
  const user = event.locals.user as any | null | undefined;
  if (!user) throw error(401, "Unauthorized");

  const spots = await placeAndSpotUseCase.getSpots(user.$id);
  return spots;
});

export const getSpotById = query(
  getSpotByIdSchema,
  async ({ id }: z.infer<typeof getSpotByIdSchema>) => {
    const event = getRequestEvent();
    const user = event.locals.user as any | null | undefined;
    if (!user) throw error(401, "Unauthorized");

    console.log("[bs] spots::remote::getSpotById", id);
    const spot = await placeAndSpotUseCase.getSpotByPlaceId(id, user.$id);
    return spot;
  }
);

export const updateSpot = command(
  updateSpotSchema,
  async ({ rowId, data }: z.infer<typeof updateSpotSchema>) => {
    const event = getRequestEvent();
    const user = event.locals.user as any | null | undefined;
    if (!user) throw error(401, "Unauthorized");

    console.log("[bs] spots::remote::updateSpot", rowId, data);
    const updatedSpot = await placeAndSpotUseCase.updateSpot(rowId, data);
    return updatedSpot;
  }
);

export const saveSpot = command(saveSpotSchema, async ({ spot }: z.infer<typeof saveSpotSchema>) => {
  const event = getRequestEvent();
  const user = event.locals.user as any | null | undefined;
  if (!user) throw error(401, "Unauthorized");

  console.log("[bs] spots::remote::saveSpot", spot);

  // `ResultPlaceRecordSchema` lacks `id`; the current use-case expects a master place record.
  const place = { id: spot.place_id, ...spot } as any;

  const savedSpot = await placeAndSpotUseCase.upsert(place, user.$id);
  return savedSpot;
});

export const deleteUserSpot = command(deleteSpotSchema, async (rowId : string) => {
    const event = getRequestEvent();
    const user = event.locals.user as any | null | undefined;
    if (!user) throw error(401, "Unauthorized");

    console.log("[bs] spots::remote::deleteUserSpot", rowId);
    const deletedSpot = await placeAndSpotUseCase.deleteSpot(rowId);
    return deletedSpot;
  }
);

