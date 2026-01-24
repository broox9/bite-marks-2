import { z } from "zod";
import { MasterPlaceRecordSchema } from "../Place/Place";

export const UserSpotResultSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  personal_rating: z.number().nullable(),
  personal_notes: z.string().nullable(),
  is_visited: z.boolean(),
  user_id: z.string(),
  place_id: z.string(),
  social_links: z.array(z.string()),
});

export const UserSpotInputSchema = UserSpotResultSchema.omit({ id: true });

export const UserSpotRecordSchema = UserSpotInputSchema.merge(MasterPlaceRecordSchema);

export type UserSpotResult = z.infer<typeof UserSpotResultSchema>;
export type UserSpotInput = z.infer<typeof UserSpotInputSchema>;
export type UserSpotRecord = z.infer<typeof UserSpotRecordSchema>;

