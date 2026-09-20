import { z } from 'zod';
import type { PlaceSearch } from '$lib/ports/backend.repository';
import { ApplicationError, type SearchLocation } from '$lib/core/domain/api';

const googlePlace = z.object({
  id: z.string(), displayName: z.object({ text: z.string() }), formattedAddress: z.string().optional(),
  location: z.object({ latitude: z.number(), longitude: z.number() }),
  rating: z.number().optional(), websiteUri: z.string().optional(), priceLevel: z.string().optional(),
  types: z.array(z.string()).optional(), primaryType: z.string().optional(),
  addressComponents: z.array(z.object({ shortText: z.string(), types: z.array(z.string()) })).optional(),
});
const responseSchema = z.object({ places: z.array(googlePlace).optional(), nextPageToken: z.string().optional() });
const prices: Record<string, string> = { PRICE_LEVEL_FREE: 'free', PRICE_LEVEL_INEXPENSIVE: 'inexpensive',
  PRICE_LEVEL_MODERATE: 'moderate', PRICE_LEVEL_EXPENSIVE: 'expensive', PRICE_LEVEL_VERY_EXPENSIVE: 'very_expensive' };

export class GooglePlaceSearch implements PlaceSearch {
  constructor(private apiKey: string | undefined, private fetcher: typeof fetch = fetch) {}
  async search(query: string, location?: SearchLocation, pageToken?: string) {
    if (!this.apiKey) throw new ApplicationError(503, 'not_configured', 'Server-side place search is not configured');
    const response = await this.fetcher('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST', signal: AbortSignal.timeout(15000), headers: {
        'Content-Type': 'application/json', 'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.websiteUri,places.priceLevel,places.types,places.primaryType,places.addressComponents,nextPageToken',
      },
      body: JSON.stringify({ textQuery: query, pageSize: 20, pageToken,
        ...(location ? { locationBias: { circle: { center: { latitude: location.lat, longitude: location.lng }, radius: location.radiusMeters } } } : {}),
      }),
    });
    if (!response.ok) throw new ApplicationError(502, 'upstream_error', 'Place search is temporarily unavailable');
    const data = responseSchema.parse(await response.json());
    return { nextPageToken: data.nextPageToken ?? null, items: (data.places ?? []).map(p => ({
      place_id: p.id, name: p.displayName.text, address: p.formattedAddress ?? '',
      lat: p.location.latitude, lng: p.location.longitude, rating: p.rating, websiteURI: p.websiteUri ?? null,
      price_level: prices[p.priceLevel ?? ''] ?? 'free', place_types: p.types ?? [], primaryType: p.primaryType,
      photos: [], neighborhood: p.addressComponents?.find(a => a.types.includes('neighborhood'))?.shortText ?? '',
      areas: p.addressComponents?.filter(a => a.types.some(t => ['locality', 'administrative_area_level_1', 'postal_code'].includes(t))).map(a => a.shortText) ?? [],
    })) };
  }
}
