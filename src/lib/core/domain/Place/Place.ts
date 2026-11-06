import { z } from "zod";

export const MasterPlaceRecordSchema = z.object({
  id: z.string(),
  place_id: z.string(),
  name: z.string(),
  address: z.string(),
  rating: z.number().optional(),
  websiteURI: z.nullish(z.string()),
  price_level: z.string(),
  lat: z.number(),
  lng: z.number(),
  photos: z.any(), // Consider specifying a more precise type if possible
  neighborhood: z.string(),
  areas: z.array(z.string()),
  place_types: z.array(z.string()),
  primaryType: z.string().optional(),
});

export const ResultPlaceRecordSchema = MasterPlaceRecordSchema.omit({ id: true });

export type MasterPlaceRecord = z.infer<typeof MasterPlaceRecordSchema>;
export type ResultPlaceRecord = z.infer<typeof ResultPlaceRecordSchema>;

/*
Google Places Data Fields
https://developers.google.com/maps/documentation/places/web-service/data-fields
Google Places Place Types
https://developers.google.com/maps/documentation/places/web-service/place-types

*/
