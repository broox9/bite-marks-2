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
    <!-- Fork twirling spaghetti -->
    <circle cx="12.9" cy="15.8" r="4.7" fill="var(--icon-fill)" stroke="none" />
    <path d="M9.6 3.2 C9.6 6.2 10.4 7.3 12 7.3 C13.6 7.3 14.4 6.2 14.4 3.2" />
    <path d="M12 3.2 L12 10.2" />
    <path d="M7.2 15.2 C7.4 12.2 16.8 12 16.8 15.2 C16.8 17.9 8.6 18.1 8.4 15.6 C8.3 13.6 14.6 13.4 14.8 15.3" />
    <path d="M6.2 19 Q12 20.6 17.8 19" />
  {:else if cuisineType === "sushi"}
    <!-- Nigiri -->
    <path d="M5 13 C7 9.8 9.8 8.4 12.8 8.4 C15.8 8.4 18.8 9.8 20.4 12.8 C18.4 13.8 15.4 14.2 12.8 14.2 C10 14.2 7 14 5 13 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M4.6 12.6 C6.6 9.4 9.4 8 12.4 8 C15.4 8 18.4 9.4 20 12.4 C18 13.4 15 13.8 12.4 13.8 C9.6 13.8 6.6 13.6 4.6 12.6 Z" />
    <path d="M9.4 8.6 L10.5 12.5 M13.6 8.4 L14.6 12.2" />
    <path d="M5.4 13.6 C4.6 14.2 4.2 15 4.2 15.9 C4.2 17.9 7.6 19.2 12 19.2 C16.4 19.2 19.8 17.9 19.8 15.9 C19.8 15 19.3 14.2 18.5 13.6" />
  {:else if cuisineType === "chinese"}
    <!-- Takeout box -->
    <path d="M6.6 6.6 L18.2 6.6 L19.4 9.6 L5.4 9.6 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M6.2 6.2 L17.8 6.2 L19 9.2 L5 9.2 Z" />
    <path d="M5.9 9.2 L7.5 20 L16.5 20 L18.1 9.2" />
    <path d="M12 9.2 L12 12.8" />
    <path d="M8.6 6.2 C8.6 3.4 15.4 3.4 15.4 6.2" />
  {:else if cuisineType === "mexican"}
    <!-- Taco -->
    <path d="M4.2 17.2 C5.4 15 6.3 17 7.7 15.2 C9.1 13.4 10 15.8 11.6 14.4 C13.2 13 14 15.4 15.6 14.4 C17.2 13.4 18 15.6 19.2 14.8 L20.8 17.2 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M3.6 16.8 C3.6 9.6 8 5.8 12 5.8 C16 5.8 20.4 9.6 20.4 16.8" />
    <path d="M3.6 16.8 C4.8 14.6 5.7 16.6 7.1 14.8 C8.5 13 9.4 15.4 11 14 C12.6 12.6 13.4 15 15 14 C16.6 13 17.4 15.2 18.6 14.4 C19.5 13.9 20.4 15.6 20.4 16.8" />
    <path d="M3.6 16.8 L20.4 16.8" />
  {:else if cuisineType === "french"}
    <!-- Baguette -->
    <path d="M5.1 19.9 C3.5 18.3 3.7 16.5 5.3 14.9 L14.9 5.3 C16.5 3.7 18.4 3.5 19.9 5.1 C21.5 6.7 21.3 8.5 19.7 10.1 L10.1 19.7 C8.5 21.3 6.7 21.5 5.1 19.9 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M4.6 19.4 C3 17.8 3.2 16 4.8 14.4 L14.4 4.8 C16 3.2 17.9 3 19.4 4.6 C21 6.2 20.8 8 19.2 9.6 L9.6 19.2 C8 20.8 6.2 21 4.6 19.4 Z" />
    <path d="M8.4 12.6 L11.4 15.6 M11.4 9.6 L14.4 12.6 M14.4 6.6 L17.4 9.6" />
  {:else if cuisineType === "indian"}
    <!-- Handi pot -->
    <path d="M7.3 10.2 C7.9 7.2 10.2 5.8 12.4 5.8 C14.6 5.8 17 7.2 17.6 10.2 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M6.8 9.8 C7.4 6.8 9.8 5.4 12 5.4 C14.2 5.4 16.6 6.8 17.2 9.8" />
    <path d="M12 5.4 L12 4.2" />
    <circle cx="12" cy="3.2" r="1" />
    <path d="M4.6 9.8 L19.4 9.8" />
    <path d="M6 9.8 C5.2 14.6 7.6 17.6 12 17.6 C16.4 17.6 18.8 14.6 18 9.8" />
    <path d="M8.8 19.8 L15.2 19.8" />
  {:else if cuisineType === "mediterranean"}
    <!-- Olive branch -->
    <circle cx="7" cy="15" r="1.7" fill="var(--icon-accent)" stroke="none" />
    <circle cx="15.4" cy="6.4" r="1.7" fill="var(--icon-accent)" stroke="none" />
    <path d="M4.4 19.6 C8.6 16.6 13 12.8 19.4 4.6" />
    <path d="M7.8 17.4 C8.4 19.2 10 19.8 11.6 19 C10.8 17.2 9.4 16.6 7.8 17.4 Z" />
    <path d="M11.4 13.4 C10.6 11.6 11.2 10 13 9.4 C13.6 11.2 12.9 12.8 11.4 13.4 Z" />
    <path d="M14.8 10.4 C15.6 12 17.2 12.4 18.8 11.4 C18 9.8 16.4 9.4 14.8 10.4 Z" />
  {:else if cuisineType === "vietnamese"}
    <!-- Phở: bowl + steam + ladle -->
    <path d="M5.1 13.1 C5.4 17.4 8.2 19.8 12.4 19.8 C16.6 19.8 19.5 17.4 19.8 13.1 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M4.2 12.6 L19.8 12.6" />
    <path d="M4.6 12.6 C4.9 17 7.8 19.4 12 19.4 C16.2 19.4 19.1 17 19.4 12.6" />
    <path d="M8.4 4.2 C7.6 5.8 7.6 7 8.4 8.6 M12.2 3.6 C11.4 5.2 11.4 6.4 12.2 8" />
    <path d="M15.4 12.6 L18.8 5.2" />
    <path d="M18.8 5.2 C19.4 4.1 20.6 4.5 20.4 5.6" />
  {:else if cuisineType === "ramen"}
    <!-- Noodle pull -->
    <path d="M5.1 13.9 C5.4 17.8 8.2 20.2 12.4 20.2 C16.6 20.2 19.5 17.8 19.8 13.9 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M9.2 2.6 L10 11 M14.8 2.2 L14 11" />
    <path d="M9.8 10 C9 11.2 9.2 12.4 9.8 13.4 M11.9 10.4 C11.3 11.4 11.5 12.4 12 13.4 M14.1 10 C13.5 11.2 13.7 12.4 14.2 13.4" />
    <path d="M4.2 13.4 L19.8 13.4" />
    <path d="M4.6 13.4 C4.9 17.4 7.8 19.8 12 19.8 C16.2 19.8 19.1 17.4 19.4 13.4" />
  {:else if cuisineType === "burger"}
    <!-- Stacked burger -->
    <path d="M5.1 11.2 C5.1 6.8 8.4 5.1 12.4 5.1 C16.4 5.1 19.9 6.8 19.9 11.2 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M4.6 10.8 C4.6 6.4 8 4.6 12 4.6 C16 4.6 19.4 6.4 19.4 10.8 Z" />
    <path d="M9 7.7 L9.6 7.4 M12.2 6.9 L12.8 6.7 M15 7.9 L15.6 7.6" />
    <path d="M4.4 13.4 Q5.6 15 6.8 13.4 T9.2 13.4 T11.6 13.4 T14 13.4 T16.4 13.4 T18.8 13.4 L19.6 13.4" />
    <path d="M5 16.3 L19 16.3" stroke-width="2" />
    <path d="M4.6 18.6 L19.4 18.6 C19.4 20 18.4 20.6 17 20.6 L7 20.6 C5.6 20.6 4.6 20 4.6 18.6 Z" />
  {:else if cuisineType === "pizza"}
    <!-- Slice -->
    <circle cx="10.6" cy="11.4" r="1.5" fill="var(--icon-accent)" stroke="none" />
    <circle cx="14" cy="12.9" r="1.25" fill="var(--icon-accent)" stroke="none" />
    <circle cx="11.9" cy="15.9" r="1.15" fill="var(--icon-accent)" stroke="none" />
    <path d="M4.6 7.4 C9 4.6 15 4.6 19.4 7.4" />
    <path d="M4.6 7.4 L12 21 L19.4 7.4" />
    <path d="M5.8 9.3 C10 6.9 14 6.9 18.2 9.3" />
  {:else if cuisineType === "steak"}
    <!-- T-bone -->
    <path d="M6.7 7.3 C4.3 9.3 4.1 12.7 6.1 15.3 C8.1 17.9 11.5 19.1 14.7 18.3 C17.9 17.5 20.3 15.1 20.1 12.3 C19.9 9.5 17.3 6.9 13.5 6.3 C10.7 5.9 8.3 6.1 6.7 7.3 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M6.2 6.8 C3.8 8.8 3.6 12.2 5.6 14.8 C7.6 17.4 11 18.6 14.2 17.8 C17.4 17 19.8 14.6 19.6 11.8 C19.4 9 16.8 6.4 13 5.8 C10.2 5.4 7.8 5.6 6.2 6.8 Z" />
    <circle cx="9" cy="10.2" r="2" />
    <path d="M13.4 9.4 C14.6 10.6 14.4 12 13.6 13.2 M15.9 10.8 C16.5 11.8 16.3 12.9 15.7 13.8" />
  {:else if cuisineType === "seafood"}
    <!-- Fish -->
    <path d="M6.5 12.4 C8.9 8.8 12.1 7.4 15.1 8 C17.5 8.6 19.3 10.4 20.7 12.4 C19.3 14.4 17.5 16.2 15.1 16.8 C12.1 17.4 8.9 16 6.5 12.4 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M6 12 C8.4 8.4 11.6 7 14.6 7.6 C17 8.2 18.8 10 20.2 12 C18.8 14 17 15.8 14.6 16.4 C11.6 17 8.4 15.6 6 12 Z" />
    <path d="M6.4 12 C4.8 10.4 3.6 9.6 2.2 9.2 C3 11 3 13 2.2 14.8 C3.6 14.4 4.8 13.6 6.4 12 Z" />
    <circle cx="16.6" cy="10.8" r="0.9" fill="currentColor" stroke="none" />
    <path d="M14 9.2 C15 10.9 15 13.1 14 14.8" />
  {:else if cuisineType === "breakfast"}
    <!-- Egg in pan -->
    <circle cx="10.2" cy="12.4" r="2.2" fill="var(--icon-accent)" stroke="none" />
    <circle cx="10.4" cy="12.6" r="7" />
    <path d="M17.4 12.2 L22.4 11.4" />
    <path d="M7 12.2 C6.6 10 8.2 8.6 10.2 8.8 C12.2 9 14 10 14 12 C14 14.2 12.6 15.8 10.4 15.8 C8.4 15.8 7.4 14.2 7 12.2 Z" />
    <circle cx="10.2" cy="12.4" r="2.2" />
  {:else if cuisineType === "coffee"}
    <!-- Cup + steam -->
    <path d="M6.3 10.1 L7.1 16.4 C7.3 18 9.3 19 12.1 19 C14.9 19 16.9 18 17.1 16.4 L17.9 10.1 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M5.8 9.6 L6.6 16 C6.8 17.6 8.8 18.6 11.6 18.6 C14.4 18.6 16.4 17.6 16.6 16 L17.4 9.6" />
    <path d="M5.4 9.6 L17.8 9.6" />
    <path d="M17.4 11 C19.6 10.8 20.6 11.8 20.2 13.2 C19.8 14.6 18.4 15.2 16.9 14.8" />
    <path d="M9.6 3.2 C8.9 4.6 8.9 5.6 9.6 7 M13.4 2.8 C12.7 4.2 12.7 5.2 13.4 6.6" />
    <path d="M7.6 20.8 L15.6 20.8" />
  {:else if cuisineType === "cocktail"}
    <!-- Martini + olive -->
    <circle cx="14.8" cy="7" r="1.6" fill="var(--icon-accent)" stroke="none" />
    <path d="M4.6 5.2 L19.4 5.2 L12.4 13.4 L4.6 5.2 Z" />
    <path d="M12.4 13.4 L12.4 19.8" />
    <path d="M8.6 20.4 L16.2 20.4" />
    <path d="M16.2 3 L14.2 9" />
    <circle cx="14.8" cy="7" r="1.6" />
  {:else if cuisineType === "chicken"}
    <!-- Drumstick -->
    <path d="M5.9 7.9 C4.1 10.5 4.5 13.9 6.9 15.9 C9.3 17.9 12.9 17.9 15.1 15.7 C17.3 13.5 17.5 10.1 15.3 7.7 C12.9 5.1 8.5 5.1 5.9 7.9 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M5.4 7.4 C3.6 10 4 13.4 6.4 15.4 C8.8 17.4 12.4 17.4 14.6 15.2 C16.8 13 17 9.6 14.8 7.2 C12.4 4.6 8 4.6 5.4 7.4 Z" />
    <path d="M13.8 14.6 L17.4 18.2" />
    <circle cx="18.9" cy="18.1" r="1.4" />
    <circle cx="17.3" cy="19.7" r="1.4" />
  {:else if cuisineType === "fastfood"}
    <!-- Fries -->
    <path d="M6.7 11.6 L8.3 20.6 L16.7 20.6 L18.3 11.6 Z" fill="var(--icon-fill)" stroke="none" />
    <path d="M8.8 11.2 L8 4.8 M11 11 L10.8 3.6 M13.4 11 L13.8 4.4 M15.6 11.4 L16.4 5.6" />
    <path d="M6.2 11.2 L7.8 20.2 L16.2 20.2 L17.8 11.2" />
    <path d="M5.6 11.4 C9.8 12.8 14.2 12.8 18.4 11.4" />
  {:else if cuisineType === "halal"}
    <!-- Crescent + star -->
    <path d="M16 9.2 L16.68 11.07 L18.66 11.13 L17.09 12.36 L17.65 14.26 L16 13.15 L14.35 14.26 L14.91 12.36 L13.34 11.13 L15.32 11.07 Z" fill="var(--icon-accent)" stroke="none" />
    <path d="M14.6 3.6 C9.6 4.4 6.2 7.8 6.2 12 C6.2 16.2 9.6 19.6 14.6 20.4 C11 18.6 9 15.6 9 12 C9 8.4 11 5.4 14.6 3.6 Z" />
  {:else}
    <!-- Default: plate + cutlery -->
    <circle cx="12" cy="12" r="3" fill="var(--icon-fill)" />
    <circle cx="12" cy="12" r="5.6" />
    <path d="M3.6 4.6 L3.6 19.4 M2.2 4.6 L2.2 7.4 C2.2 8.6 5 8.6 5 7.4 L5 4.6" />
    <path d="M20.6 4.6 C22.2 7.2 22.2 9.8 20.6 12 L20.6 19.4" />
  {/if}
</svg>

<style>
  .cuisine-icon {
    /* Two-color system: ink stroke (currentColor) + accent.
     * --icon-accent: solid accent details (olives, yolk, pepperoni…)
     * --icon-fill:   soft accent wash, derived from the accent hue */
    --icon-accent: var(--cta-primary);
    --icon-fill: oklch(from var(--icon-accent) 0.93 calc(c * 0.5) h);

    flex-shrink: 0;
    color: var(--bg-medium-contrast);
  }
</style>
