/* Cuisine classification for CuisineIcon. Lives outside the component so the
 * rule ordering — which is load-bearing — can be covered by tests. */

/* Keyed to the Google Places "Food and Drink" table. place_types reach us with
 * underscores already swapped for spaces (see placesToRecord.ts) while
 * primaryType keeps its raw `italian_restaurant` form, so normalise both.
 * First match wins — order is load-bearing:
 *   · "bar and grill" / "wine bar" resolve before the bare \bbar\b rule
 *   · "ramen" before the generic "asian" catch-all
 *   · \bdeli\b is word-bounded so "meal delivery" doesn't hit it
 *   · "tea house" is spelled out because "steak" contains "tea" */
export const CUISINE_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bpizza\b/, "pizza"],
  [/hamburger|burger/, "burger"],
  [/steak|churrasc|brazilian/, "steak"],
  [/sushi|japanese|izakaya/, "sushi"],
  [/ramen/, "ramen"],
  [/vietnamese|\bpho\b/, "vietnamese"],
  [/thai/, "thai"],
  [/korean|barbecue|\bbbq\b|bar and grill/, "bbq"],
  [/chinese|dim sum|dumpling|szechuan|cantonese/, "chinese"],
  [/\bindian\b|curry/, "indian"],
  [/mexican|taco|taqueria|tex mex/, "mexican"],
  [/french|bistro|brasserie/, "french"],
  [/mediterranean|greek|spanish|tapas/, "mediterranean"],
  [/middle eastern|lebanese|turkish|afghani|kebab|shawarma|falafel/, "skewer"],
  [/halal/, "halal"],
  [/seafood|oyster|fish/, "seafood"],
  [/chicken|wings/, "chicken"],
  [/sandwich|\bdeli\b|delicatessen|sub shop/, "sandwich"],
  [/bakery|bagel|patisserie|pastry|croissant/, "bakery"],
  [/ice cream|gelato|frozen yogurt|acai|shaved ice/, "icecream"],
  [/dessert|donut|doughnut|candy|chocolate|confectioner|\bcake\b|cupcake/, "dessert"],
  [/juice|smoothie|boba|bubble tea/, "juice"],
  [/tea house|teahouse|tea room/, "tea"],
  [/buffet|cafeteria|food court/, "restaurant"],
  [/coffee|cafe|espresso/, "coffee"],
  [/wine/, "wine"],
  [/\bpub\b|brewery|brewpub|beer|\bbar\b/, "beer"],
  [/cocktail|lounge|speakeasy|nightclub/, "cocktail"],
  [/vegan|vegetarian|salad|plant based/, "veggie"],
  [/breakfast|brunch|diner|pancake/, "breakfast"],
  [/fast food|fries|drive through/, "fastfood"],
  [/asian|indonesian|malaysian|filipino/, "ramen"],
  [/american/, "burger"],
  [/italian|pasta|trattoria|osteria/, "italian"],
];

export function getCuisineType(types: string[], primary?: string): string {
  const haystack = [...types, primary ?? ""]
    .join(" ")
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  for (const [pattern, cuisine] of CUISINE_RULES) {
    if (pattern.test(haystack)) return cuisine;
  }
  return "restaurant";
}
