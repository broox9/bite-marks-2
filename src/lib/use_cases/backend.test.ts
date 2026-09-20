import { describe, expect, it, vi } from 'vitest';
import { operations, type BackendContext } from './backend';
import { READ_SCOPE, WRITE_SCOPE } from '$lib/core/domain/api';
import type { BackendRepository, PlaceSearch, TextGeneration } from '$lib/ports/backend.repository';

const defaultLocation = {
  name: 'Downtown Brooklyn',
  lat: 40.6928,
  lng: -73.9903,
  radiusMeters: 3200,
};

function makeContext(scopes: string[] = [READ_SCOPE, WRITE_SCOPE]) {
  const repository = {
    listSpots: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
    getSpot: vi.fn().mockResolvedValue(null),
    saveSpot: vi.fn(),
    updateSpot: vi.fn(),
    deleteSpot: vi.fn(),
    listTags: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
    getTag: vi.fn(),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
    listPlaces: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
    getPlace: vi.fn(),
    getPreferences: vi.fn().mockResolvedValue({ defaultLocation }),
    updatePreferences: vi.fn(),
  } as unknown as BackendRepository;
  const places = { search: vi.fn().mockResolvedValue({ items: [], nextPageToken: null }) } as PlaceSearch;
  const ai = { respond: vi.fn().mockResolvedValue('hello') } as TextGeneration;
  const context: BackendContext = { principal: { userId: 'user-1', scopes }, repository, places, ai };
  return { context, repository, places, ai };
}

describe('shared backend operations', () => {
  it('allows reads but blocks writes for a read-only agent', async () => {
    const { context, repository } = makeContext([READ_SCOPE]);
    await expect(operations.list_spots.execute(context, {})).resolves.toEqual({ items: [], nextCursor: null });
    await expect(operations.create_tag.execute(context, { tagName: 'date night' })).rejects.toMatchObject({
      status: 403,
      code: 'insufficient_scope',
    });
    expect(repository.createTag).not.toHaveBeenCalled();
  });

  it('uses the saved location when a search has no explicit location', async () => {
    const { context, places } = makeContext();
    await operations.search_places.execute(context, { query: 'ramen' });
    expect(places.search).toHaveBeenCalledWith('ramen', defaultLocation, undefined);
  });

  it('lets an explicit search location override the saved default', async () => {
    const { context, places } = makeContext();
    const explicit = { name: 'Queens', lat: 40.7282, lng: -73.7949, radiusMeters: 5000 };
    await operations.search_places.execute(context, { query: 'dumplings', location: explicit });
    expect(places.search).toHaveBeenCalledWith('dumplings', explicit, undefined);
  });

  it('returns a stable not-found error for resources outside the account', async () => {
    const { context } = makeContext();
    await expect(operations.get_spot.execute(context, { id: 'missing' })).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
    });
  });

  it('rejects unknown fields at the shared boundary', async () => {
    const { context, repository } = makeContext();
    await expect(operations.list_spots.execute(context, { limit: 10, userId: 'someone-else' })).rejects.toThrow();
    expect(repository.listSpots).not.toHaveBeenCalled();
  });
});
