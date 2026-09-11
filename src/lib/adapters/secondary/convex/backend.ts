import type { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import type { Doc, Id } from '$convex/_generated/dataModel';
import { ConvexAdapter, toDomainSpot } from './index';
import { PlaceAndSpotUseCase } from '$lib/use_cases/placeAndSpot';
import type { BackendRepository, Page, Tag, Preferences } from '$lib/ports/backend.repository';
import type { PageInput, spotUpdateSchema } from '$lib/core/domain/api';
import type { ResultPlaceRecord } from '$lib/core/domain/Place/Place';
import type { z } from 'zod';

const paginationOpts = ({ limit, cursor }: PageInput) => ({ numItems: limit, cursor: cursor ?? null });
const page = <T, U>(result: { page: T[]; isDone: boolean; continueCursor: string }, map: (value: T) => U): Page<U> => ({
  items: result.page.map(map), nextCursor: result.isDone ? null : result.continueCursor,
});
const tag = (row: Doc<'tags'>): Tag => ({ id: row._id, tagName: row.tagName, userId: row.userId,
  createdAt: new Date(row._creationTime).toISOString(), updatedAt: new Date(row.updatedAt ?? row._creationTime).toISOString() });
const place = (row: Doc<'places'>): ResultPlaceRecord => ({
  place_id: row.placeId, name: row.name, address: row.address, rating: row.rating,
  websiteURI: row.websiteURI, price_level: row.priceLevel, lat: row.lat, lng: row.lng,
  photos: row.photos, neighborhood: row.neighborhood, areas: row.areas,
  place_types: row.placeTypes, primaryType: row.primaryType,
});

export class ConvexBackend implements BackendRepository {
  private spots: PlaceAndSpotUseCase;
  constructor(private client: ConvexHttpClient, private userId: string) {
    this.spots = new PlaceAndSpotUseCase(new ConvexAdapter(client));
  }
  async listSpots(input: PageInput) { return page(await this.client.query(api.spots.listPage, { paginationOpts: paginationOpts(input) }), toDomainSpot); }
  async getSpot(id: string) { return this.spots.getSpotByPlaceId(id, this.userId); }
  async saveSpot(input: ResultPlaceRecord) {
    const result = await this.spots.upsert({ ...input, id: input.place_id }, this.userId);
    if (!result.success) throw new Error('Failed to save spot');
    return { spot: toDomainSpot(result.spotResult), alreadyExisted: result.alreadyExisted as boolean };
  }
  async updateSpot(id: string, data: z.infer<typeof spotUpdateSchema>) { return this.spots.updateSpot(id, data, this.userId); }
  async deleteSpot(id: string) { return Boolean((await this.spots.deleteSpot(id, this.userId)).success); }
  async listTags(input: PageInput) { return page(await this.client.query(api.tags.listPage, { paginationOpts: paginationOpts(input) }), tag); }
  async getTag(id: string) { const row = await this.client.query(api.tags.get, { id: id as Id<'tags'> }); return row ? tag(row) : null; }
  async createTag(tagName: string) { return tag(await this.client.mutation(api.tags.create, { userId: this.userId, tagName })); }
  async updateTag(id: string, tagName: string) { const row = await this.client.mutation(api.tags.update, { id: id as Id<'tags'>, tagName }); return row ? tag(row) : null; }
  async deleteTag(id: string) { return this.client.mutation(api.tags.remove, { id: id as Id<'tags'> }); }
  async listPlaces(input: PageInput) { return page(await this.client.query(api.places.listPage, { paginationOpts: paginationOpts(input) }), place); }
  async getPlace(id: string) { const row = await this.client.query(api.places.getByPlaceId, { placeId: id }); return row ? place(row) : null; }
  async getPreferences() { return this.client.query(api.preferences.get, {}); }
  async updatePreferences(input: Preferences) { return this.client.mutation(api.preferences.update, input); }
}
