<script lang="ts">
  type CuisineIconProps = {
    placeTypes?: string[];
    primaryType?: string;
    size?: number;
  };

  const { placeTypes = [], primaryType, size = 20 }: CuisineIconProps = $props();

  // Map place types to cuisine categories
  function getCuisineType(types: string[], primary?: string): string {
    const typeString = [...types, primary || ""].join(" ").toLowerCase();

    // Order matters - check specific types before generic ones
    if (typeString.includes("italian")) return "italian";
    if (typeString.includes("sushi") || typeString.includes("japanese")) return "sushi";
    if (typeString.includes("chinese")) return "chinese";
    if (typeString.includes("mexican")) return "mexican";
    if (typeString.includes("french")) return "french";
    if (typeString.includes("indian")) return "indian";
    if (typeString.includes("mediterranean")) return "mediterranean";
    if (typeString.includes("vietnamese")) return "vietnamese";
    if (typeString.includes("ramen") || typeString.includes("noodle")) return "ramen";
    if (typeString.includes("hamburger") || typeString.includes("burger")) return "burger";
    if (typeString.includes("pizza")) return "pizza";
    if (typeString.includes("steak")) return "steak";
    if (typeString.includes("seafood")) return "seafood";
    if (typeString.includes("breakfast") || typeString.includes("brunch")) return "breakfast";
    if (typeString.includes("coffee")) return "coffee";
    if (typeString.includes("cocktail") || typeString.includes("wine bar") || typeString.includes("lounge")) return "cocktail";
    if (typeString.includes("chicken")) return "chicken";
    if (typeString.includes("fast food")) return "fastfood";
    if (typeString.includes("halal")) return "halal";

    return "restaurant"; // default fallback
  }

  const cuisineType = $derived(getCuisineType(placeTypes, primaryType));
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="cuisine-icon"
  aria-hidden="true"
>
  {#if cuisineType === "italian"}
    <!-- Pasta/Spaghetti Bowl -->
    <ellipse cx="12" cy="17" rx="8" ry="4" fill="var(--icon-fill)" stroke="currentColor" />
    <path d="M7 14 Q8 10, 9 12 T11 10 Q12 8, 13 11 T15 9 Q16 11, 17 13" stroke-width="2" />
    <path d="M8 13 Q9 9, 10 11 T12 9 Q13 7, 14 10 T16 8" stroke-width="2" />
  {:else if cuisineType === "sushi"}
    <!-- Sushi Roll -->
    <circle cx="12" cy="12" r="7" fill="var(--icon-fill)" stroke="currentColor" stroke-width="2" />
    <circle cx="12" cy="12" r="3" fill="var(--icon-accent)" />
    <path d="M12 5 L12 19 M5 12 L19 12" stroke="currentColor" stroke-width="1" opacity="0.3" />
  {:else if cuisineType === "chinese"}
    <!-- Fortune Cookie -->
    <path d="M6 14 Q12 8, 18 14 Q12 16, 6 14 Z" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <path d="M9 13 L15 13" stroke="currentColor" stroke-width="1" opacity="0.4" />
  {:else if cuisineType === "mexican"}
    <!-- Taco -->
    <path d="M4 16 Q6 8, 12 6 Q18 8, 20 16 L18 17 Q12 14, 6 17 Z" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <path d="M8 13 L16 13 M9 15 L15 15" stroke="currentColor" stroke-width="1" opacity="0.4" />
  {:else if cuisineType === "french"}
    <!-- Croissant -->
    <path d="M4 14 Q5 10, 8 12 L10 13 Q12 10, 14 13 L16 12 Q19 10, 20 14 Q18 16, 16 15 Q12 17, 8 15 Q6 16, 4 14 Z" 
          fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
  {:else if cuisineType === "burger"}
    <!-- Hamburger -->
    <path d="M4 10 Q4 7, 12 7 Q20 7, 20 10 L20 11 L4 11 Z" fill="var(--icon-fill)" stroke="currentColor" />
    <rect x="4" y="11" width="16" height="3" fill="var(--icon-accent)" stroke="currentColor" />
    <rect x="4" y="14" width="16" height="2" fill="var(--icon-fill)" stroke="currentColor" />
    <path d="M4 16 L20 16 Q20 18, 19 18 L5 18 Q4 18, 4 16 Z" fill="var(--icon-fill)" stroke="currentColor" />
  {:else if cuisineType === "pizza"}
    <!-- Pizza Slice -->
    <path d="M12 4 L20 20 L4 20 Z" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <circle cx="10" cy="16" r="1.5" fill="var(--icon-accent)" />
    <circle cx="14" cy="14" r="1.5" fill="var(--icon-accent)" />
    <circle cx="11" cy="12" r="1.5" fill="var(--icon-accent)" />
  {:else if cuisineType === "indian"}
    <!-- Curry Bowl -->
    <path d="M6 11 Q6 9, 12 9 Q18 9, 18 11 L18 16 Q18 18, 12 18 Q6 18, 6 16 Z" 
          fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <ellipse cx="12" cy="11" rx="6" ry="2" fill="var(--icon-accent)" opacity="0.6" />
    <circle cx="9" cy="13" r="1" fill="var(--icon-accent)" />
    <circle cx="13" cy="14" r="0.8" fill="var(--icon-accent)" />
  {:else if cuisineType === "mediterranean"}
    <!-- Pita/Falafel -->
    <ellipse cx="12" cy="13" rx="7" ry="8" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <path d="M12 5 Q12 13, 12 21" stroke="currentColor" stroke-width="1" opacity="0.3" />
    <circle cx="10" cy="11" r="1.5" fill="var(--icon-accent)" />
    <circle cx="14" cy="13" r="1.5" fill="var(--icon-accent)" />
  {:else if cuisineType === "vietnamese"}
    <!-- Pho Bowl -->
    <ellipse cx="12" cy="16" rx="8" ry="4" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <path d="M6 14 Q7 9, 8 11 T10 9 Q11 8, 12 11 T14 9 Q15 11, 16 13" stroke-width="1.5" />
    <line x1="9" y1="6" x2="9" y2="13" stroke="currentColor" stroke-width="1.5" />
    <line x1="15" y1="6" x2="15" y2="13" stroke="currentColor" stroke-width="1.5" />
  {:else if cuisineType === "ramen"}
    <!-- Ramen Bowl -->
    <ellipse cx="12" cy="16" rx="8" ry="4" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <path d="M6 14 Q8 11, 10 13 T14 11 Q16 13, 18 14" stroke-width="2" />
    <circle cx="9" cy="14" r="1.5" fill="var(--icon-accent)" />
    <line x1="15" y1="6" x2="15" y2="14" stroke="currentColor" stroke-width="2" />
  {:else if cuisineType === "steak"}
    <!-- Steak -->
    <path d="M6 10 Q8 8, 12 8 Q16 8, 18 10 L18 15 Q16 17, 12 17 Q8 17, 6 15 Z" 
          fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <path d="M8 11 L16 11 M8 13 L16 13 M8 15 L16 15" stroke="currentColor" stroke-width="0.5" opacity="0.3" />
  {:else if cuisineType === "seafood"}
    <!-- Fish -->
    <path d="M4 12 Q8 8, 12 8 Q16 8, 20 12 Q16 16, 12 16 Q8 16, 4 12 Z" 
          fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <circle cx="15" cy="11" r="1" fill="currentColor" />
    <path d="M20 12 L22 10 M20 12 L22 14" stroke="currentColor" stroke-width="1.5" />
  {:else if cuisineType === "breakfast"}
    <!-- Fried Egg -->
    <ellipse cx="12" cy="13" rx="7" ry="6" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <circle cx="12" cy="13" r="3" fill="var(--icon-accent)" stroke="currentColor" />
  {:else if cuisineType === "coffee"}
    <!-- Coffee Cup -->
    <path d="M6 8 L6 16 Q6 18, 12 18 Q18 18, 18 16 L18 8" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <path d="M6 8 L18 8" stroke="currentColor" stroke-width="1.5" />
    <path d="M18 10 L20 10 Q21 10, 21 12 Q21 14, 20 14 L18 14" stroke="currentColor" stroke-width="1.5" fill="none" />
    <path d="M9 4 Q9 5, 10 6 M12 4 Q12 5, 13 6" stroke="currentColor" stroke-width="1.5" />
  {:else if cuisineType === "cocktail"}
    <!-- Cocktail Glass -->
    <path d="M6 6 L18 6 L12 14 L12 19" stroke="currentColor" stroke-width="1.5" />
    <line x1="9" y1="19" x2="15" y2="19" stroke="currentColor" stroke-width="1.5" />
    <circle cx="14" cy="8" r="1.5" fill="var(--icon-accent)" />
  {:else if cuisineType === "chicken"}
    <!-- Chicken Drumstick -->
    <ellipse cx="10" cy="10" rx="4" ry="5" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <path d="M12 15 L13 19 Q13 20, 12 20 Q11 20, 11 19 L12 15" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
  {:else if cuisineType === "fastfood"}
    <!-- Fast Food Bag -->
    <path d="M7 10 L9 20 L15 20 L17 10 Z" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <path d="M9 10 Q9 6, 12 6 Q15 6, 15 10" stroke="currentColor" stroke-width="1.5" fill="none" />
    <rect x="10" y="13" width="4" height="4" fill="var(--icon-accent)" opacity="0.5" />
  {:else if cuisineType === "halal"}
    <!-- Halal Symbol (Crescent and Star simplified) -->
    <path d="M10 6 Q7 8, 7 12 Q7 16, 10 18 Q9 17, 9 12 Q9 7, 10 6 Z" 
          fill="var(--icon-fill)" stroke="currentColor" stroke-width="1" />
    <path d="M14 9 L15 11 L17 11 L15.5 12.5 L16 14.5 L14 13 L12 14.5 L12.5 12.5 L11 11 L13 11 Z" 
          fill="var(--icon-fill)" stroke="currentColor" stroke-width="0.5" />
  {:else}
    <!-- Default Restaurant Icon - Plate with fork and knife -->
    <circle cx="12" cy="13" r="7" fill="var(--icon-fill)" stroke="currentColor" stroke-width="1.5" />
    <path d="M8 7 L8 12 M8 9 L7 9 M8 9 L9 9" stroke="currentColor" stroke-width="1.5" />
    <path d="M16 7 L16 12 M16 7 L15 9" stroke="currentColor" stroke-width="1.5" />
  {/if}
</svg>

<style>
  .cuisine-icon {
    --icon-fill: oklch(from var(--bg-medium-contrast) l c h / 0.12);
    --icon-accent: var(--accent-color);
    
    flex-shrink: 0;
    color: var(--bg-medium-contrast);
  }
</style>
