import { describe, it, expect } from 'vitest';
import { MasterPlaceRecordSchema, ResultPlaceRecordSchema } from './Place';

const validMasterPlace = {
  id: 'doc-id',
  place_id: 'ChIJabc',
  name: 'Test Place',
  address: '1 Main St',
  rating: 4.2,
  websiteURI: 'https://example.com',
  price_level: 'moderate',
  lat: 40.7,
  lng: -73.9,
  photos: [],
  neighborhood: 'SoHo',
  areas: ['NY'],
  place_types: ['restaurant'],
};

describe('MasterPlaceRecordSchema', () => {
  it('parses a valid master place record', () => {
    expect(MasterPlaceRecordSchema.safeParse(validMasterPlace).success).toBe(true);
  });

  it('parses without optional rating', () => {
    const { rating, ...without } = validMasterPlace;
    expect(MasterPlaceRecordSchema.safeParse(without).success).toBe(true);
  });

  it('parses without optional primaryType', () => {
    expect(MasterPlaceRecordSchema.safeParse({ ...validMasterPlace, primaryType: undefined }).success).toBe(true);
  });

  it('fails when id is missing', () => {
    const { id, ...without } = validMasterPlace;
    expect(MasterPlaceRecordSchema.safeParse(without).success).toBe(false);
  });

  it('fails when place_id is missing', () => {
    const { place_id, ...without } = validMasterPlace;
    expect(MasterPlaceRecordSchema.safeParse(without).success).toBe(false);
  });

  it('fails when lat is not a number', () => {
    expect(MasterPlaceRecordSchema.safeParse({ ...validMasterPlace, lat: 'not-a-number' }).success).toBe(false);
  });

  it('fails when lng is not a number', () => {
    expect(MasterPlaceRecordSchema.safeParse({ ...validMasterPlace, lng: null }).success).toBe(false);
  });

  it('fails when areas is not an array', () => {
    expect(MasterPlaceRecordSchema.safeParse({ ...validMasterPlace, areas: 'NY' }).success).toBe(false);
  });

  it('fails when place_types is not an array', () => {
    expect(MasterPlaceRecordSchema.safeParse({ ...validMasterPlace, place_types: 'restaurant' }).success).toBe(false);
  });
});

describe('ResultPlaceRecordSchema', () => {
  it('parses a valid record without id', () => {
    const { id, ...withoutId } = validMasterPlace;
    expect(ResultPlaceRecordSchema.safeParse(withoutId).success).toBe(true);
  });

  it('strips the id field when present (since it is omitted from schema)', () => {
    const result = ResultPlaceRecordSchema.safeParse(validMasterPlace);
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).id).toBeUndefined();
    }
  });

  it('fails when place_id is missing', () => {
    const { id, place_id, ...without } = validMasterPlace;
    expect(ResultPlaceRecordSchema.safeParse(without).success).toBe(false);
  });
});
