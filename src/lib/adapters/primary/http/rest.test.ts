import { describe, expect, it, vi } from 'vitest';
import { handleRest, openApiDocument, readJson } from './rest';
import { READ_SCOPE, WRITE_SCOPE } from '$lib/core/domain/api';
import type { BackendContext } from '$lib/use_cases/backend';

function makeContext(scopes: string[] = [READ_SCOPE, WRITE_SCOPE]) {
  return {
    principal: { userId: 'user-1', scopes },
    repository: {
      listSpots: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
      getSpot: vi.fn().mockResolvedValue(null),
      saveSpot: vi.fn(), updateSpot: vi.fn(), deleteSpot: vi.fn(),
      listTags: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
      getTag: vi.fn(), createTag: vi.fn(), updateTag: vi.fn(), deleteTag: vi.fn(),
      listPlaces: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
      getPlace: vi.fn(),
      getPreferences: vi.fn().mockResolvedValue({ defaultLocation: null }),
      updatePreferences: vi.fn(),
    },
    places: { search: vi.fn().mockResolvedValue({ items: [], nextPageToken: null }) },
    ai: { respond: vi.fn().mockResolvedValue('') },
  } as unknown as BackendContext;
}

describe('REST adapter', () => {
  it('serializes paginated data and coerces query parameters', async () => {
    const context = makeContext();
    const response = await handleRest(new Request('https://bite.example/api/v1/spots?limit=10'), 'spots', async () => context);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { items: [], nextCursor: null } });
    expect(context.repository.listSpots).toHaveBeenCalledWith({ limit: 10 });
  });

  it('prefers the literal places/search route over places/{id}', async () => {
    const context = makeContext();
    const response = await handleRest(new Request('https://bite.example/api/v1/places/search', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'pizza' }),
    }), 'places/search', async () => context);
    expect(response.status).toBe(200);
    expect(context.places.search).toHaveBeenCalledWith('pizza', undefined, undefined);
    expect(context.repository.getPlace).not.toHaveBeenCalled();
  });

  it('returns structured permission failures for write operations', async () => {
    const context = makeContext([READ_SCOPE]);
    const response = await handleRest(new Request('https://bite.example/api/v1/tags', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tagName: 'favorites' }),
    }), 'tags', async () => context);
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'insufficient_scope' } });
  });

  it('reports 405 without constructing a backend context', async () => {
    const context = vi.fn(async () => makeContext());
    const response = await handleRest(new Request('https://bite.example/api/v1/spots', { method: 'PUT' }), 'spots', context);
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, POST');
    expect(context).not.toHaveBeenCalled();
  });

  it('accepts JSON-compatible media types and rejects other bodies', async () => {
    await expect(readJson(new Request('https://bite.example', {
      method: 'POST', headers: { 'Content-Type': 'application/problem+json' }, body: '{"ok":true}',
    }))).resolves.toEqual({ ok: true });
    await expect(readJson(new Request('https://bite.example', {
      method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}',
    }))).rejects.toMatchObject({ status: 415, code: 'unsupported_media_type' });
  });

  it('generates OpenAPI for every REST operation', () => {
    const document = openApiDocument('https://bite.example') as { openapi: string; paths: Record<string, unknown> };
    expect(document.openapi).toBe('3.1.0');
    expect(document.paths['/places/search']).toBeDefined();
    expect(document.paths['/me/preferences']).toBeDefined();
    expect(document.paths['/ai/responses']).toBeDefined();
  });
});
