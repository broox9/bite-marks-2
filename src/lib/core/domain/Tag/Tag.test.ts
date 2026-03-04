import { describe, it, expect } from 'vitest';
import { TagResultSchema, TagInputSchema } from './Tag';

const validTag = {
  id: 'tag-1',
  tagName: 'vegetarian',
  userId: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

describe('TagResultSchema', () => {
  it('parses a valid tag', () => {
    expect(TagResultSchema.safeParse(validTag).success).toBe(true);
  });

  it('fails when tagName is missing', () => {
    const { tagName, ...without } = validTag;
    expect(TagResultSchema.safeParse(without).success).toBe(false);
  });

  it('fails when userId is missing', () => {
    const { userId, ...without } = validTag;
    expect(TagResultSchema.safeParse(without).success).toBe(false);
  });

  it('fails when id is missing', () => {
    const { id, ...without } = validTag;
    expect(TagResultSchema.safeParse(without).success).toBe(false);
  });

  it('fails when createdAt is missing', () => {
    const { createdAt, ...without } = validTag;
    expect(TagResultSchema.safeParse(without).success).toBe(false);
  });
});

describe('TagInputSchema', () => {
  it('parses input with just tagName and userId', () => {
    expect(TagInputSchema.safeParse({ tagName: 'vegan', userId: 'user-1' }).success).toBe(true);
  });

  it('fails when tagName is missing', () => {
    expect(TagInputSchema.safeParse({ userId: 'user-1' }).success).toBe(false);
  });

  it('fails when userId is missing', () => {
    expect(TagInputSchema.safeParse({ tagName: 'vegan' }).success).toBe(false);
  });
});
