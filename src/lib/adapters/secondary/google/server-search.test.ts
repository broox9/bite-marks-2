import { describe, expect, it, vi } from 'vitest';
import { GooglePlaceSearch } from './server-search';

describe('GooglePlaceSearch', () => {
  it('keeps the API key server-side and maps location-biased results', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({
      places: [{
        id: 'google-place-1', displayName: { text: 'Noodle Bar' }, formattedAddress: '1 Main St',
        location: { latitude: 40.7, longitude: -73.9 }, rating: 4.6,
        websiteUri: 'https://example.com', priceLevel: 'PRICE_LEVEL_MODERATE',
        types: ['restaurant'], primaryType: 'restaurant',
        addressComponents: [
          { shortText: 'SoHo', types: ['neighborhood'] },
          { shortText: 'New York', types: ['locality'] },
        ],
      }],
      nextPageToken: 'next',
    }));
    const search = new GooglePlaceSearch('secret-key', fetcher);
    const location = { name: 'Manhattan', lat: 40.75, lng: -73.98, radiusMeters: 4000 };

    const result = await search.search('noodles', location);

    expect(fetcher).toHaveBeenCalledOnce();
    const [, init] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get('X-Goog-Api-Key')).toBe('secret-key');
    expect(JSON.parse(String(init.body))).toMatchObject({
      textQuery: 'noodles',
      locationBias: { circle: { center: { latitude: 40.75, longitude: -73.98 }, radius: 4000 } },
    });
    expect(result).toEqual({
      nextPageToken: 'next',
      items: [expect.objectContaining({ place_id: 'google-place-1', name: 'Noodle Bar', price_level: 'moderate', neighborhood: 'SoHo' })],
    });
  });

  it('fails closed when no server key is configured', async () => {
    await expect(new GooglePlaceSearch(undefined).search('coffee')).rejects.toMatchObject({
      status: 503,
      code: 'not_configured',
    });
  });
});
