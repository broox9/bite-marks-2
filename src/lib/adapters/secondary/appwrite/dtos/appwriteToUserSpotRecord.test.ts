import { describe, it, expect } from 'vitest';
import { transformAppwriteToUserSpotRecord } from './appwriteToUserSpotRecord';

const mockPlace = {
  $id: 'ChIJabc123',
  place_id: 'ChIJabc123',
  name: 'Test Restaurant',
  address: '123 Test St',
  rating: 4.5,
  websiteURI: 'https://test.com',
  price_level: 'moderate',
  lat: 40.7,
  lng: -73.9,
  photos: [],
  neighborhood: 'Midtown',
  areas: ['NY', '10001'],
  place_types: ['restaurant'],
  primaryType: 'restaurant',
};

const mockAppwriteDoc = {
  $id: 'spot-doc-id',
  personal_rating: null,
  personal_notes: null,
  is_visited: false,
  user_id: 'user-123',
  social_links: [],
  place_id: mockPlace,
};

describe('transformAppwriteToUserSpotRecord', () => {
  it('maps spot fields from the appwrite doc', () => {
    const result = transformAppwriteToUserSpotRecord(mockAppwriteDoc);
    expect(result.id).toBe('spot-doc-id');
    expect(result.user_id).toBe('user-123');
    expect(result.is_visited).toBe(false);
    expect(result.personal_rating).toBeNull();
    expect(result.personal_notes).toBeNull();
    expect(result.social_links).toEqual([]);
  });

  it('maps place fields from the expanded place_id object', () => {
    const result = transformAppwriteToUserSpotRecord(mockAppwriteDoc);
    expect(result.address).toBe('123 Test St');
    expect(result.rating).toBe(4.5);
    expect(result.lat).toBe(40.7);
    expect(result.lng).toBe(-73.9);
    expect(result.neighborhood).toBe('Midtown');
    expect(result.areas).toEqual(['NY', '10001']);
    expect(result.primaryType).toBe('restaurant');
  });

  it('handles place_id as an array (relationship format)', () => {
    const doc = { ...mockAppwriteDoc, place_id: [mockPlace] };
    const result = transformAppwriteToUserSpotRecord(doc);
    expect(result.address).toBe('123 Test St');
    expect(result.lat).toBe(40.7);
  });

  it('uses place.$id as place_id on the result', () => {
    const result = transformAppwriteToUserSpotRecord(mockAppwriteDoc);
    expect(result.place_id).toBe('ChIJabc123');
  });

  it('prefers doc name over place name', () => {
    const doc = { ...mockAppwriteDoc, name: 'Custom Name' };
    const result = transformAppwriteToUserSpotRecord(doc);
    expect(result.name).toBe('Custom Name');
  });

  it('falls back to place name when doc name is absent', () => {
    const result = transformAppwriteToUserSpotRecord(mockAppwriteDoc);
    expect(result.name).toBe('Test Restaurant');
  });

  it('defaults is_visited to false when undefined', () => {
    const doc = { ...mockAppwriteDoc, is_visited: undefined };
    const result = transformAppwriteToUserSpotRecord(doc);
    expect(result.is_visited).toBe(false);
  });

  it('defaults social_links to empty array when not an array', () => {
    const doc = { ...mockAppwriteDoc, social_links: null };
    const result = transformAppwriteToUserSpotRecord(doc);
    expect(result.social_links).toEqual([]);
  });

  it('defaults areas to empty array when place has no areas', () => {
    const doc = { ...mockAppwriteDoc, place_id: { ...mockPlace, areas: null } };
    const result = transformAppwriteToUserSpotRecord(doc);
    expect(result.areas).toEqual([]);
  });

  it('defaults place_types to empty array when absent from place', () => {
    const doc = { ...mockAppwriteDoc, place_id: { ...mockPlace, place_types: undefined } };
    const result = transformAppwriteToUserSpotRecord(doc);
    expect(result.place_types).toEqual([]);
  });

  it('defaults lat/lng to 0 when absent from place', () => {
    const doc = { ...mockAppwriteDoc, place_id: { $id: 'p1' } };
    const result = transformAppwriteToUserSpotRecord(doc);
    expect(result.lat).toBe(0);
    expect(result.lng).toBe(0);
  });

  it('defaults price_level to "free" when absent from place', () => {
    const doc = { ...mockAppwriteDoc, place_id: { $id: 'p1' } };
    const result = transformAppwriteToUserSpotRecord(doc);
    expect(result.price_level).toBe('free');
  });
});
