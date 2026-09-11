import { z } from 'zod';
import { ApplicationError, requirePermission, pageSchema, idSchema, saveSpotSchema, spotUpdateSchema,
  tagInputSchema, searchSchema, preferencesSchema, aiInputSchema, type Principal } from '$lib/core/domain/api';
import type { BackendRepository, PlaceSearch, TextGeneration } from '$lib/ports/backend.repository';

export type BackendContext = { principal: Principal; repository: BackendRepository; places: PlaceSearch; ai: TextGeneration };
function found<T>(value: T | null): T {
  if (value === null) throw new ApplicationError(404, 'not_found', 'Resource not found');
  return value;
}
const empty = z.object({}).strict();
const id = z.object({ id: idSchema }).strict();
function operation<S extends z.ZodType>(schema: S, write: boolean, description: string,
  run: (ctx: BackendContext, input: z.output<S>) => Promise<unknown>) {
  return { schema, write, description, async execute(ctx: BackendContext, input: unknown) {
    requirePermission(ctx.principal, write);
    return run(ctx, schema.parse(input));
  } };
}
export const operations = {
  list_spots: operation(pageSchema, false, 'List your saved spots, including notes, ratings and visited status.', (c, i) => c.repository.listSpots(i)),
  get_spot: operation(id, false, 'Read one of your saved spots by its spot ID.', async (c, i) => found(await c.repository.getSpot(i.id))),
  save_spot: operation(saveSpotSchema, true, 'Save a place to your own spots; saving it twice does not create a duplicate.', (c, i) => c.repository.saveSpot(i.place)),
  update_spot: operation(id.extend({ data: spotUpdateSchema }), true, 'Edit your notes, rating, visited status or social links.', async (c, i) => found(await c.repository.updateSpot(i.id, i.data))),
  delete_spot: operation(id, true, 'Permanently delete your saved spot, notes and rating. The shared place is retained.', async (c, i) => {
    if (!await c.repository.deleteSpot(i.id)) found(null);
    return { success: true };
  }),
  list_tags: operation(pageSchema, false, 'List your private tags.', (c, i) => c.repository.listTags(i)),
  get_tag: operation(id, false, 'Read one of your private tags.', async (c, i) => found(await c.repository.getTag(i.id))),
  create_tag: operation(tagInputSchema, true, 'Create a private tag.', (c, i) => c.repository.createTag(i.tagName)),
  update_tag: operation(id.extend(tagInputSchema.shape), true, 'Rename one of your private tags.', async (c, i) => found(await c.repository.updateTag(i.id, i.tagName))),
  delete_tag: operation(id, true, 'Permanently delete one of your private tags.', async (c, i) => {
    if (!await c.repository.deleteTag(i.id)) found(null);
    return { success: true };
  }),
  list_places: operation(pageSchema, false, 'Browse the shared place catalog. Personal notes and ratings are excluded.', (c, i) => c.repository.listPlaces(i)),
  get_place: operation(id, false, 'Read a catalog place using its Google place ID.', async (c, i) => found(await c.repository.getPlace(i.id))),
  search_places: operation(searchSchema, false, 'Search Google Places. Explicit location overrides your saved default; without either, the query determines location.', async (c, i) => {
    const location = i.location ?? (await c.repository.getPreferences()).defaultLocation ?? undefined;
    return c.places.search(i.query, location, i.pageToken);
  }),
  get_preferences: operation(empty, false, 'Read your saved default search location.', c => c.repository.getPreferences()),
  update_preferences: operation(preferencesSchema, true, 'Set or clear your default search location for all clients.', (c, i) => c.repository.updatePreferences(i)),
  get_account: operation(empty, false, 'Read the authenticated account identifier and this connection’s permissions.', async c => c.principal),
  create_ai_response: operation(aiInputSchema, false, 'Generate an AI text response. This operation does not change your data.', async (c, i) => ({ text: await c.ai.respond(i.prompt) })),
};
export type OperationName = keyof typeof operations;
