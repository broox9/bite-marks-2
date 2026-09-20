import type { z } from 'zod';
import type { ResultPlaceRecord } from '$lib/core/domain/Place/Place';
import type { UserSpotRecord } from '$lib/core/domain/Spot/Spot';
import type { PageInput, SearchLocation, spotUpdateSchema } from '$lib/core/domain/api';

export type Spot = UserSpotRecord & { rowId: string; $id: string };
export type Tag = { id: string; tagName: string; userId: string; createdAt: string; updatedAt: string };
export type Page<T> = { items: T[]; nextCursor: string | null };
export type Preferences = { defaultLocation: SearchLocation | null };
export interface BackendRepository {
  listSpots(input: PageInput): Promise<Page<Spot>>;
  getSpot(id: string): Promise<Spot | null>;
  saveSpot(place: ResultPlaceRecord): Promise<{ spot: Spot; alreadyExisted: boolean }>;
  updateSpot(id: string, data: z.infer<typeof spotUpdateSchema>): Promise<Spot | null>;
  deleteSpot(id: string): Promise<boolean>;
  listTags(input: PageInput): Promise<Page<Tag>>;
  getTag(id: string): Promise<Tag | null>;
  createTag(name: string): Promise<Tag>;
  updateTag(id: string, name: string): Promise<Tag | null>;
  deleteTag(id: string): Promise<boolean>;
  listPlaces(input: PageInput): Promise<Page<ResultPlaceRecord>>;
  getPlace(id: string): Promise<ResultPlaceRecord | null>;
  getPreferences(): Promise<Preferences>;
  updatePreferences(input: Preferences): Promise<Preferences>;
}
export interface PlaceSearch {
  search(query: string, location?: SearchLocation, pageToken?: string): Promise<{ items: ResultPlaceRecord[]; nextPageToken: string | null }>;
}
export interface TextGeneration { respond(prompt: string): Promise<string> }
