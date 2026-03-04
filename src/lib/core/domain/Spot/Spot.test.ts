import { describe, it, expect } from 'vitest';
import { UserSpotResultSchema, UserSpotInputSchema } from './Spot';

const validSpot = {
  id: 'spot-id',
  name: 'My Spot',
  personal_rating: null,
  personal_notes: null,
  is_visited: false,
  user_id: 'user-1',
  place_id: 'ChIJabc',
  social_links: [],
};

describe('UserSpotResultSchema', () => {
  it('parses a valid user spot', () => {
    expect(UserSpotResultSchema.safeParse(validSpot).success).toBe(true);
  });

  it('parses with a numeric personal_rating', () => {
    expect(UserSpotResultSchema.safeParse({ ...validSpot, personal_rating: 4.5 }).success).toBe(true);
  });

  it('parses with a string personal_notes', () => {
    expect(UserSpotResultSchema.safeParse({ ...validSpot, personal_notes: 'Great place!' }).success).toBe(true);
  });

  it('parses with non-empty social_links', () => {
    expect(UserSpotResultSchema.safeParse({ ...validSpot, social_links: ['https://ig.com/spot'] }).success).toBe(true);
  });

  it('fails when id is missing', () => {
    const { id, ...without } = validSpot;
    expect(UserSpotResultSchema.safeParse(without).success).toBe(false);
  });

  it('fails when is_visited is not a boolean', () => {
    expect(UserSpotResultSchema.safeParse({ ...validSpot, is_visited: 'yes' }).success).toBe(false);
  });

  it('fails when social_links is not an array', () => {
    expect(UserSpotResultSchema.safeParse({ ...validSpot, social_links: null }).success).toBe(false);
  });

  it('fails when user_id is missing', () => {
    const { user_id, ...without } = validSpot;
    expect(UserSpotResultSchema.safeParse(without).success).toBe(false);
  });
});

describe('UserSpotInputSchema', () => {
  it('parses valid input without id', () => {
    const { id, ...input } = validSpot;
    expect(UserSpotInputSchema.safeParse(input).success).toBe(true);
  });

  it('fails when is_visited is missing', () => {
    const { id, is_visited, ...without } = validSpot;
    expect(UserSpotInputSchema.safeParse(without).success).toBe(false);
  });
});
