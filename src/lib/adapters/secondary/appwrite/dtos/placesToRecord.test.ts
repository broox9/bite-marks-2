import { describe, it, expect } from 'vitest';
import { transformResultToPlace } from './placesToRecord';

describe('transformResultToPlace', () => {
  describe('name normalization', () => {
    it('uses displayName string when available', () => {
      const result = transformResultToPlace({ displayName: 'Pizza Place', place_id: 'abc', lat: 0, lng: 0 });
      expect(result.name).toBe('Pizza Place');
    });

    it('uses displayName.text when displayName is an object', () => {
      const result = transformResultToPlace({ displayName: { text: 'Burger Joint', languageCode: 'en' }, place_id: 'abc', lat: 0, lng: 0 });
      expect(result.name).toBe('Burger Joint');
    });

    it('falls back to name when displayName is absent', () => {
      const result = transformResultToPlace({ name: 'Taco Spot', place_id: 'abc', lat: 0, lng: 0 });
      expect(result.name).toBe('Taco Spot');
    });

    it('returns empty string when no name fields are present', () => {
      const result = transformResultToPlace({ place_id: 'abc', lat: 0, lng: 0 });
      expect(result.name).toBe('');
    });
  });

  describe('address normalization', () => {
    it('prefers formattedAddress', () => {
      const result = transformResultToPlace({ formattedAddress: '123 Main St', address: 'old addr', place_id: 'abc', lat: 0, lng: 0 });
      expect(result.address).toBe('123 Main St');
    });

    it('falls back to address', () => {
      const result = transformResultToPlace({ address: '456 Elm St', place_id: 'abc', lat: 0, lng: 0 });
      expect(result.address).toBe('456 Elm St');
    });

    it('defaults to empty string when both absent', () => {
      const result = transformResultToPlace({ place_id: 'abc', lat: 0, lng: 0 });
      expect(result.address).toBe('');
    });
  });

  describe('place_id normalization', () => {
    it('uses id field first', () => {
      const result = transformResultToPlace({ id: 'google-id', place_id: 'old-id', lat: 0, lng: 0 });
      expect(result.place_id).toBe('google-id');
    });

    it('falls back to place_id field', () => {
      const result = transformResultToPlace({ place_id: 'my-place-id', lat: 0, lng: 0 });
      expect(result.place_id).toBe('my-place-id');
    });

    it('defaults to empty string when neither is present', () => {
      const result = transformResultToPlace({ lat: 0, lng: 0 });
      expect(result.place_id).toBe('');
    });
  });

  describe('price level normalization', () => {
    it.each([
      ['free', 'free'],
      ['inexpensive', 'inexpensive'],
      ['moderate', 'moderate'],
      ['expensive', 'expensive'],
      ['very_expensive', 'very_expensive'],
    ] as const)('passes through already-normalized string %s', (input, expected) => {
      const result = transformResultToPlace({ place_id: 'abc', lat: 0, lng: 0, priceLevel: input });
      expect(result.price_level).toBe(expected);
    });

    it.each([
      ['PRICE_LEVEL_FREE', 'free'],
      ['PRICE_LEVEL_INEXPENSIVE', 'inexpensive'],
      ['PRICE_LEVEL_MODERATE', 'moderate'],
      ['PRICE_LEVEL_EXPENSIVE', 'expensive'],
      ['PRICE_LEVEL_VERY_EXPENSIVE', 'very_expensive'],
    ])('normalizes Google enum string %s to %s', (input, expected) => {
      const result = transformResultToPlace({ place_id: 'abc', lat: 0, lng: 0, priceLevel: input });
      expect(result.price_level).toBe(expected);
    });

    it.each([
      [0, 'free'],
      [1, 'inexpensive'],
      [2, 'moderate'],
      [3, 'expensive'],
      [4, 'very_expensive'],
      [99, 'very_expensive'],
    ] as const)('normalizes numeric price level %d to %s', (input, expected) => {
      const result = transformResultToPlace({ place_id: 'abc', lat: 0, lng: 0, priceLevel: input });
      expect(result.price_level).toBe(expected);
    });

    it('defaults to free when price level is absent', () => {
      const result = transformResultToPlace({ place_id: 'abc', lat: 0, lng: 0 });
      expect(result.price_level).toBe('free');
    });

    it('resolves VERY_EXPENSIVE before EXPENSIVE (order matters)', () => {
      const result = transformResultToPlace({ place_id: 'abc', lat: 0, lng: 0, priceLevel: 'PRICE_LEVEL_VERY_EXPENSIVE' });
      expect(result.price_level).toBe('very_expensive');
    });
  });

  describe('coordinates', () => {
    it('uses flat lat/lng directly', () => {
      const result = transformResultToPlace({ place_id: 'abc', lat: 40.7, lng: -73.9 });
      expect(result.lat).toBe(40.7);
      expect(result.lng).toBe(-73.9);
    });

    it('calls location.lat() and location.lng() when they are functions', () => {
      const result = transformResultToPlace({ place_id: 'abc', location: { lat: () => 41.0, lng: () => -74.0 } });
      expect(result.lat).toBe(41.0);
      expect(result.lng).toBe(-74.0);
    });

    it('defaults to 0 when no coordinate info is present', () => {
      const result = transformResultToPlace({ place_id: 'abc' });
      expect(result.lat).toBe(0);
      expect(result.lng).toBe(0);
    });
  });

  describe('place_types', () => {
    it('removes last 2 items and replaces underscores with spaces', () => {
      const result = transformResultToPlace({
        place_id: 'abc', lat: 0, lng: 0,
        types: ['italian_restaurant', 'restaurant', 'food', 'point_of_interest', 'establishment'],
      });
      expect(result.place_types).toEqual(['italian restaurant', 'restaurant', 'food']);
    });

    it('falls back to place_types field when types is absent', () => {
      // slice(0, -2) removes the last 2 generic Google types
      const result = transformResultToPlace({
        place_id: 'abc', lat: 0, lng: 0,
        place_types: ['italian_restaurant', 'restaurant', 'food', 'establishment'],
      });
      expect(result.place_types).toEqual(['italian restaurant', 'restaurant']);
    });

    it('returns empty array when neither types nor place_types exists', () => {
      const result = transformResultToPlace({ place_id: 'abc', lat: 0, lng: 0 });
      expect(result.place_types).toEqual([]);
    });
  });

  describe('neighborhood and areas from addressComponents', () => {
    it('extracts neighborhood from sublocality', () => {
      const result = transformResultToPlace({
        place_id: 'abc', lat: 0, lng: 0,
        addressComponents: [
          { types: ['sublocality'], shortText: 'Lower East Side' },
        ],
      });
      expect(result.neighborhood).toBe('Lower East Side');
    });

    it('extracts neighborhood from neighborhood type', () => {
      const result = transformResultToPlace({
        place_id: 'abc', lat: 0, lng: 0,
        addressComponents: [
          { types: ['neighborhood'], shortText: 'Tribeca' },
        ],
      });
      expect(result.neighborhood).toBe('Tribeca');
    });

    it('prefers placeResult.neighborhood over addressComponents when non-empty', () => {
      const result = transformResultToPlace({
        place_id: 'abc', lat: 0, lng: 0,
        neighborhood: 'Chelsea',
        addressComponents: [
          { types: ['sublocality'], shortText: 'Soho' },
        ],
      });
      expect(result.neighborhood).toBe('Chelsea');
    });

    it('collects areas from sublocality_level_1, administrative_area_1, postal_code', () => {
      const result = transformResultToPlace({
        place_id: 'abc', lat: 0, lng: 0,
        addressComponents: [
          { types: ['sublocality_level_1'], shortText: 'Manhattan' },
          { types: ['administrative_area_1'], shortText: 'NY' },
          { types: ['postal_code'], shortText: '10001' },
        ],
      });
      expect(result.areas).toContain('Manhattan');
      expect(result.areas).toContain('NY');
      expect(result.areas).toContain('10001');
    });

    it('prefers placeResult.areas over computed areas when it is an array', () => {
      const result = transformResultToPlace({
        place_id: 'abc', lat: 0, lng: 0,
        areas: ['Brooklyn', 'NY'],
        addressComponents: [
          { types: ['administrative_area_1'], shortText: 'NJ' },
        ],
      });
      expect(result.areas).toEqual(['Brooklyn', 'NY']);
    });
  });
});
