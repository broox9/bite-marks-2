import { describe, expect, it } from 'vitest';
import { getPriceSymbols } from './price-level';

describe('getPriceSymbols', () => {
  it.each([
    ['inexpensive', '$'],
    ['moderate', '$$'],
    ['expensive', '$$$'],
    ['very_expensive', '$$$$'],
    ['very expensive', '$$$$'],
  ])('maps %s to %s', (priceLevel, expected) => {
    expect(getPriceSymbols(priceLevel)).toBe(expected);
  });

  it('does not display symbols for free or unknown levels', () => {
    expect(getPriceSymbols('free')).toBe('');
    expect(getPriceSymbols('')).toBe('');
  });
});
