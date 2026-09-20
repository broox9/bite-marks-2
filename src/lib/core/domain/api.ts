import { z } from 'zod';
import { ResultPlaceRecordSchema } from './Place/Place';

export const READ_SCOPE = 'bite:read';
export const WRITE_SCOPE = 'bite:write';
export const locationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusMeters: z.number().positive().max(50000),
}).strict();
export type SearchLocation = z.infer<typeof locationSchema>;
export const preferencesSchema = z.object({ defaultLocation: locationSchema.nullable() }).strict();
export const pageSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(4000).nullable().optional(),
}).strict();
export type PageInput = z.infer<typeof pageSchema>;
export const idSchema = z.string().min(1).max(200);
export const spotUpdateSchema = z.object({
  personal_rating: z.number().min(0).max(5).nullable().optional(),
  personal_notes: z.string().max(10000).nullable().optional(),
  is_visited: z.boolean().optional(),
  social_links: z.array(z.url().max(2000)).max(30).optional(),
}).strict().refine(value => Object.keys(value).length > 0, 'Provide at least one field');
export const placeInputSchema = ResultPlaceRecordSchema.extend({
  place_id: idSchema,
  name: z.string().trim().min(1).max(500),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  photos: z.array(z.unknown()).max(20),
}).strict();
export const saveSpotSchema = z.object({ place: placeInputSchema }).strict();
export const tagInputSchema = z.object({ tagName: z.string().trim().min(1).max(100) }).strict();
export const searchSchema = z.object({
  query: z.string().trim().min(1).max(500),
  location: locationSchema.optional(),
  pageToken: z.string().max(4000).optional(),
}).strict();
export const aiInputSchema = z.object({ prompt: z.string().trim().min(1).max(10000) }).strict();

export class ApplicationError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export type Principal = { userId: string; scopes: readonly string[] };
export function requirePermission(principal: Principal, write = false) {
  if (!principal.userId) throw new ApplicationError(401, 'unauthorized', 'Sign in required');
  if (!principal.scopes.includes(READ_SCOPE) || (write && !principal.scopes.includes(WRITE_SCOPE))) {
    throw new ApplicationError(403, 'insufficient_scope', 'This connection does not have permission for this operation');
  }
}
