import { describe, expect, it } from 'vitest';
import {
  activeLocationFromSaved,
  clampRadiusMiles,
  findDefaultLocation,
  findSavedLocationWithChangedRadius,
  parseActiveLocation,
  SavedLocationInputSchema,
  type ActiveLocation,
  type SavedLocation,
} from './Location';
import { MAX_RADIUS_MILES, MIN_RADIUS_MILES } from './limits';

const home: SavedLocation = {
  id: 'loc-home',
  name: 'Home',
  lat: 40.7,
  lng: -73.9,
  radiusMiles: 5,
  isDefault: true,
};

const work: SavedLocation = {
  id: 'loc-work',
  name: 'Work',
  lat: 40.75,
  lng: -73.98,
  radiusMiles: 2,
  isDefault: false,
};

describe('SavedLocationInputSchema', () => {
  it('accepts a valid location and trims the name', () => {
    const parsed = SavedLocationInputSchema.parse({ name: '  Home ', lat: 1, lng: 2, radiusMiles: 5 });
    expect(parsed.name).toBe('Home');
  });

  it('rejects blank names, out-of-range coordinates, and radii past the Google limit', () => {
    const base = { name: 'Home', lat: 1, lng: 2, radiusMiles: 5 };
    expect(SavedLocationInputSchema.safeParse({ ...base, name: '   ' }).success).toBe(false);
    expect(SavedLocationInputSchema.safeParse({ ...base, lat: 91 }).success).toBe(false);
    expect(SavedLocationInputSchema.safeParse({ ...base, lng: -181 }).success).toBe(false);
    expect(
      SavedLocationInputSchema.safeParse({ ...base, radiusMiles: MAX_RADIUS_MILES + 1 }).success,
    ).toBe(false);
  });
});

describe('clampRadiusMiles', () => {
  it('keeps the radius within the supported range', () => {
    expect(clampRadiusMiles(50)).toBe(MAX_RADIUS_MILES);
    expect(clampRadiusMiles(0)).toBe(MIN_RADIUS_MILES);
    expect(clampRadiusMiles(12)).toBe(12);
    expect(clampRadiusMiles(Number.NaN)).toBe(MAX_RADIUS_MILES);
  });
});

describe('findDefaultLocation', () => {
  it('returns the default location or null', () => {
    expect(findDefaultLocation([work, home])).toBe(home);
    expect(findDefaultLocation([work])).toBeNull();
    expect(findDefaultLocation([])).toBeNull();
  });
});

describe('activeLocationFromSaved', () => {
  it('carries the saved coordinates, radius, and id', () => {
    expect(activeLocationFromSaved(home)).toEqual({
      name: 'Home',
      center: { lat: 40.7, lng: -73.9 },
      radiusMiles: 5,
      savedLocationId: 'loc-home',
    });
  });
});

describe('parseActiveLocation', () => {
  const active: ActiveLocation = activeLocationFromSaved(home);

  it('round-trips a cached location', () => {
    expect(parseActiveLocation(JSON.stringify(active))).toEqual(active);
  });

  it('returns null for missing, malformed, or invalid values', () => {
    expect(parseActiveLocation(null)).toBeNull();
    expect(parseActiveLocation('{not json')).toBeNull();
    expect(parseActiveLocation(JSON.stringify({ name: 'Home' }))).toBeNull();
  });

  it('clamps radii cached before the 30-mile cap', () => {
    const legacy = JSON.stringify({ ...active, radiusMiles: 50 });
    expect(parseActiveLocation(legacy)?.radiusMiles).toBe(MAX_RADIUS_MILES);
  });
});

describe('findSavedLocationWithChangedRadius', () => {
  it('returns the saved location when the active radius differs', () => {
    const active = { ...activeLocationFromSaved(home), radiusMiles: 10 };
    expect(findSavedLocationWithChangedRadius(active, [home, work])).toBe(home);
  });

  it('returns null when the radius matches or the active location is unsaved', () => {
    expect(findSavedLocationWithChangedRadius(activeLocationFromSaved(home), [home])).toBeNull();
    const unsaved = { ...activeLocationFromSaved(home), savedLocationId: null, radiusMiles: 10 };
    expect(findSavedLocationWithChangedRadius(unsaved, [home])).toBeNull();
  });

  it('returns null when the saved location no longer exists', () => {
    const active = { ...activeLocationFromSaved(home), radiusMiles: 10 };
    expect(findSavedLocationWithChangedRadius(active, [work])).toBeNull();
  });
});
