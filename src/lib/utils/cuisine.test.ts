import { describe, expect, it } from 'vitest';
import { getCuisineType } from './cuisine';

/** place_types reach the component with underscores already swapped for spaces. */
const asPlaceTypes = (...types: string[]) => types.map((t) => t.replace(/_/g, ' '));

describe('getCuisineType', () => {
  it('falls back to restaurant when nothing matches', () => {
    expect(getCuisineType([])).toBe('restaurant');
    expect(getCuisineType(['restaurant', 'food', 'establishment'])).toBe('restaurant');
    expect(getCuisineType(['point of interest'], 'establishment')).toBe('restaurant');
  });

  it('reads the raw underscore form of primaryType', () => {
    expect(getCuisineType([], 'italian_restaurant')).toBe('italian');
    expect(getCuisineType([], 'ice_cream_shop')).toBe('icecream');
  });

  describe('Google Places "Food and Drink" types', () => {
    const cases: Array<[string, string]> = [
      ['italian_restaurant', 'italian'],
      ['sushi_restaurant', 'sushi'],
      ['japanese_restaurant', 'sushi'],
      ['ramen_restaurant', 'ramen'],
      ['asian_restaurant', 'ramen'],
      ['indonesian_restaurant', 'ramen'],
      ['chinese_restaurant', 'chinese'],
      ['mexican_restaurant', 'mexican'],
      ['french_restaurant', 'french'],
      ['indian_restaurant', 'indian'],
      ['mediterranean_restaurant', 'mediterranean'],
      ['greek_restaurant', 'mediterranean'],
      ['spanish_restaurant', 'mediterranean'],
      ['vietnamese_restaurant', 'vietnamese'],
      ['thai_restaurant', 'thai'],
      ['korean_restaurant', 'bbq'],
      ['barbecue_restaurant', 'bbq'],
      ['middle_eastern_restaurant', 'skewer'],
      ['lebanese_restaurant', 'skewer'],
      ['turkish_restaurant', 'skewer'],
      ['afghani_restaurant', 'skewer'],
      ['hamburger_restaurant', 'burger'],
      ['american_restaurant', 'burger'],
      ['pizza_restaurant', 'pizza'],
      ['steak_house', 'steak'],
      ['brazilian_restaurant', 'steak'],
      ['seafood_restaurant', 'seafood'],
      ['breakfast_restaurant', 'breakfast'],
      ['brunch_restaurant', 'breakfast'],
      ['diner', 'breakfast'],
      ['coffee_shop', 'coffee'],
      ['cafe', 'coffee'],
      ['cat_cafe', 'coffee'],
      ['tea_house', 'tea'],
      ['juice_shop', 'juice'],
      ['bakery', 'bakery'],
      ['bagel_shop', 'bakery'],
      ['sandwich_shop', 'sandwich'],
      ['deli', 'sandwich'],
      ['ice_cream_shop', 'icecream'],
      ['acai_shop', 'icecream'],
      ['dessert_shop', 'dessert'],
      ['donut_shop', 'dessert'],
      ['candy_store', 'dessert'],
      ['chocolate_factory', 'dessert'],
      ['confectionery', 'dessert'],
      ['vegan_restaurant', 'veggie'],
      ['vegetarian_restaurant', 'veggie'],
      ['fast_food_restaurant', 'fastfood'],
      ['wine_bar', 'wine'],
      ['bar', 'beer'],
      ['pub', 'beer'],
      ['bar_and_grill', 'bbq'],
      ['buffet_restaurant', 'restaurant'],
      ['cafeteria', 'restaurant'],
      ['food_court', 'restaurant'],
      ['fine_dining_restaurant', 'restaurant'],
      ['meal_takeaway', 'restaurant'],
    ];

    it.each(cases)('maps %s to %s', (placeType, expected) => {
      expect(getCuisineType(asPlaceTypes(placeType, 'restaurant'))).toBe(expected);
    });
  });

  describe('ordering traps', () => {
    it('resolves wine_bar and bar_and_grill before the bare bar rule', () => {
      expect(getCuisineType(asPlaceTypes('wine_bar', 'bar'))).toBe('wine');
      expect(getCuisineType(asPlaceTypes('bar_and_grill', 'bar'))).toBe('bbq');
    });

    it('does not let barbecue fall through to the bar rule', () => {
      expect(getCuisineType(asPlaceTypes('barbecue_restaurant'))).toBe('bbq');
    });

    it('does not mistake meal_delivery for a deli', () => {
      expect(getCuisineType(asPlaceTypes('meal_delivery'))).toBe('restaurant');
    });

    it('does not mistake the "tea" inside "steak" for a tea house', () => {
      expect(getCuisineType(asPlaceTypes('steak_house'))).toBe('steak');
    });

    it('does not mistake indonesian for indian', () => {
      expect(getCuisineType(asPlaceTypes('indonesian_restaurant'))).toBe('ramen');
    });

    it('prefers a specific cuisine over the asian catch-all', () => {
      expect(getCuisineType(asPlaceTypes('chinese_restaurant', 'asian_restaurant'))).toBe('chinese');
      expect(getCuisineType(asPlaceTypes('korean_restaurant', 'asian_restaurant'))).toBe('bbq');
    });

    it('treats bubble tea as a juice shop rather than a tea house', () => {
      expect(getCuisineType(asPlaceTypes('bubble_tea_shop'))).toBe('juice');
    });

    it('does not treat a cafeteria as a coffee shop', () => {
      expect(getCuisineType(asPlaceTypes('cafeteria'))).toBe('restaurant');
    });
  });
});
