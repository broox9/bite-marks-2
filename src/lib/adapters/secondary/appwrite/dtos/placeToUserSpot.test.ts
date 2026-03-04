import { describe, it, expect } from 'vitest';
import { transformPlaceToUserSpot } from './placeToUserSpot';

const mockPlace = {
  place_id: 'ChIJabc',
  name: 'Test Spot',
  address: '1 Main St',
  rating: 4.2,
  websiteURI: 'https://example.com',
  price_level: 'moderate' as const,
  lat: 40.7,
  lng: -73.9,
  photos: [],
  neighborhood: 'SoHo',
  areas: ['NY'],
  place_types: ['restaurant'],
};

describe('transformPlaceToUserSpot', () => {
  it('wraps place_id in an array', () => {
    const result = transformPlaceToUserSpot(mockPlace, 'user-1');
    expect(result.place_id).toEqual(['ChIJabc']);
  });

  it('sets user_id from the second argument', () => {
    const result = transformPlaceToUserSpot(mockPlace, 'user-42');
    expect(result.user_id).toBe('user-42');
  });

  it('copies name from place', () => {
    const result = transformPlaceToUserSpot(mockPlace, 'user-1');
    expect(result.name).toBe('Test Spot');
  });

  it('sets default null/false values for spot-specific fields', () => {
    const result = transformPlaceToUserSpot(mockPlace, 'user-1');
    expect(result.personal_rating).toBeNull();
    expect(result.personal_notes).toBeNull();
    expect(result.is_visited).toBe(false);
    expect(result.social_links).toEqual([]);
  });
});
