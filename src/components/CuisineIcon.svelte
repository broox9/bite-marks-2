<script lang="ts">
  import { getCuisineType } from "$lib/utils/cuisine";

  type CuisineIconProps = {
    placeTypes?: string[];
    primaryType?: string;
    size?: number;
  };

  const { placeTypes = [], primaryType, size = 20 }: CuisineIconProps = $props();

  const cuisineType = $derived(getCuisineType(placeTypes, primaryType));

  /* Optical stroke correction. The grid is drawn for 1.8 at 24px; below ~18px
   * a 1.8 stroke lands under 1.35 device px and the glyph goes soft, so nudge
   * it up. Above 32px the reverse — thin it slightly so it reads as drawn. */
  const stroke = $derived(size <= 18 ? 2 : size >= 40 ? 1.6 : 1.8);
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  class="cuisine-icon"
  aria-hidden="true"
>
  {#if cuisineType === "italian"}
    <!-- Plate of pasta -->
    <path d="M2.2 17.4h19.6c0 2.2-4.4 3.9-9.8 3.9s-9.8-1.7-9.8-3.9z" />
    <path d="M4.8 17.4C4.8 13.4 6.1 11.6 7.6 11.6 8.9 11.6 9 13.8 9.8 13.8 10.8 13.8 10.9 10.4 12 10.4 13.1 10.4 13.2 13.8 14.2 13.8 15 13.8 15.1 11.6 16.4 11.6 17.9 11.6 19.2 13.4 19.2 17.4" />
  {:else if cuisineType === "sushi"}
    <!-- Maki rolls, end on -->
    <circle cx="8.2" cy="12.2" r="5.4" />
    <circle cx="8.2" cy="12.2" r="1.9" fill="currentColor" stroke="none" />
    <circle cx="18" cy="15.8" r="3" />
    <circle cx="18" cy="15.8" r="1.2" fill="currentColor" stroke="none" />
  {:else if cuisineType === "chinese"}
    <!-- Oyster-pail takeout carton -->
    <path d="M4.6 10h14.8l-2.5 9.6a2 2 0 0 1-1.9 1.5H9a2 2 0 0 1-1.9-1.5z" />
    <path d="M4.6 10 8.2 5.6h7.6L19.4 10z" />
    <path d="M12 5.6V10" />
  {:else if cuisineType === "mexican"}
    <!-- Folded taco shell with filling -->
    <path d="M2.6 8.4c-.2 1.3 0 2.1.2 2.9.6 5.2 4.4 8.6 9.2 8.6s8.6-3.4 9.2-8.6c.2-.8.4-1.6.2-2.9" />
    <path d="M3 11.4Q4.4 7.4 7.6 9.3Q9.8 5.5 13 8.1Q15.8 5.7 17.4 8.9Q19.6 7.9 21 11.4" />
  {:else if cuisineType === "french"}
    <!-- Scored baguette -->
    <path d="M4.6 19.4a3.4 3.4 0 0 1 0-4.8L14.6 4.6a3.4 3.4 0 0 1 4.8 4.8L9.4 19.4a3.4 3.4 0 0 1-4.8 0z" />
    <path d="M8.2 12.6 11 15.4M11 9.8l2.8 2.8M13.8 7l2.8 2.8" />
  {:else if cuisineType === "indian"}
    <!-- Handi pot with knob lid -->
    <path d="M4.4 10.6h15.2" />
    <path d="M7.2 10.6c.5-3.1 2.6-4.8 4.8-4.8s4.3 1.7 4.8 4.8" />
    <path d="M12 5.8V4.4" />
    <circle cx="12" cy="3.2" r="1.2" fill="currentColor" stroke="none" />
    <path d="M5.8 10.6c-.6 5.2 1.9 8.6 6.2 8.6s6.8-3.4 6.2-8.6" />
    <path d="M8.8 21h6.4" />
  {:else if cuisineType === "mediterranean"}
    <!-- Olive branch -->
    <path d="M3.6 20.4C8 17 12.8 12 19.6 3.8" />
    <path d="M8.4 17.6c1.8 2.4 4.4 2.6 6.8.6-1.8-2.4-4.4-2.6-6.8-.6z" />
    <circle cx="10.6" cy="12.8" r="2.4" />
    <circle cx="16.4" cy="6.6" r="3" />
  {:else if cuisineType === "vietnamese"}
    <!-- Phở: broth bowl, ladle, steam -->
    <path d="M3.4 12.6h17.2" />
    <path d="M4.2 12.6c.4 4.6 3.5 7.4 7.8 7.4s7.4-2.8 7.8-7.4" />
    <path d="M8 3.8c-1 1.9-1 3.3 0 5.2M11.8 3.2c-1 1.9-1 3.3 0 5.2" />
    <path d="M15.4 12.6 19.6 5.8" />
    <path d="M18 4.8 21 6.6" />
  {:else if cuisineType === "ramen"}
    <!-- Noodle lift: chopsticks over a bowl -->
    <path d="M3.4 13h17.2" />
    <path d="M4.2 13c.4 4.6 3.5 7.4 7.8 7.4s7.4-2.8 7.8-7.4" />
    <path d="M8.2 2.6 9.7 8.6M15.8 2.6 14.3 8.6" />
    <path d="M9.7 8.6c1.2 3.6 3.4 3.6 4.6 0" />
  {:else if cuisineType === "burger"}
    <!-- Stacked burger -->
    <path d="M3.6 11.4a8.4 8.4 0 0 1 16.8 0z" />
    <path d="M3.8 14.6h16.4" />
    <path d="M4 17.8h16a2.6 2.6 0 0 1-2.6 2.6H6.6A2.6 2.6 0 0 1 4 17.8z" />
    <circle cx="8.4" cy="8.6" r=".75" fill="currentColor" stroke="none" />
    <circle cx="12.4" cy="7.4" r=".75" fill="currentColor" stroke="none" />
    <circle cx="16" cy="8.9" r=".75" fill="currentColor" stroke="none" />
  {:else if cuisineType === "pizza"}
    <!-- Slice -->
    <path d="M4 7.4c5-2.6 11-2.6 16 0L12 21z" />
    <path d="M5.9 9.4c3.9-1.7 8.3-1.7 12.2 0" />
    <circle cx="10.2" cy="12.2" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="14" cy="13.6" r="1.05" fill="currentColor" stroke="none" />
    <circle cx="11.7" cy="16.6" r="1" fill="currentColor" stroke="none" />
  {:else if cuisineType === "steak"}
    <!-- Cut of meat with a marbled fat seam -->
    <path d="M2.8 13c-.4-3.4 2.8-6.4 6.9-6.4 2.2 0 3.5 1 5.5 1.3 3 .3 5.4 1.9 5.9 4.3.5 2.9-1.8 5.2-5 5.8-2.6.5-3.9 1.5-6.7 1.1-3.6-.5-6.3-2.8-6.6-6.1z" />
    <path d="M5.8 13.9c1.6-1.9 3.3-2.5 5.1-1.9 1.8.7 2.4 2.3 4.4 2.3 1.4 0 2.5-.6 3.3-1.7" />
  {:else if cuisineType === "seafood"}
    <!-- Fish -->
    <path d="M5.8 12c2.6-3.9 6.1-5.5 9.3-4.8 2.8.6 4.8 2.8 6.1 4.8-1.3 2-3.3 4.2-6.1 4.8-3.2.7-6.7-.9-9.3-4.8z" />
    <path d="M6 12c-1.7-1.6-2.7-2.4-4.2-2.9.9 1.9.9 3.9 0 5.8 1.5-.5 2.5-1.3 4.2-2.9z" />
    <path d="M12.4 8.9c1.1 1.9 1.1 4.3 0 6.2" />
    <circle cx="17.2" cy="10.4" r=".85" fill="currentColor" stroke="none" />
  {:else if cuisineType === "breakfast"}
    <!-- Fried egg -->
    <path d="M5.6 11.2c-.6-3.1 1.5-5.7 4.6-5.7 2 0 3.1 1.4 4.7 1.7 2.3.4 4.4 1.5 4.8 3.8.4 2.2-.9 3.7-.5 5.2.5 1.9-1.1 3.5-3.1 3.5-1.6 0-2.4-.8-3.9-.6-2.1.3-4.3 1-5.9-.5-1.5-1.5-1.1-3.4-1.2-4.6-.1-1.1-.3-1.9-.5-2.8z" />
    <circle cx="10.4" cy="12.4" r="2.8" />
  {:else if cuisineType === "coffee"}
    <!-- Cup, handle, steam -->
    <path d="M4.6 9.6h12.6v4.4a4.6 4.6 0 0 1-4.6 4.6H9.2a4.6 4.6 0 0 1-4.6-4.6z" />
    <path d="M17.2 11.4h1.4a2.6 2.6 0 0 1 0 5.2h-1.4" />
    <path d="M8.6 3.2c-1 1.7-1 3 0 4.7M12.8 2.8c-1 1.7-1 3 0 4.7" />
    <path d="M6.4 21h9" />
  {:else if cuisineType === "cocktail"}
    <!-- Martini with olive -->
    <path d="M3.8 5.6h16.4L12 13.9z" />
    <path d="M12 13.9v5.5" />
    <path d="M8.2 20.4h7.6" />
    <path d="M16.6 3.2 14 8.4" />
    <circle cx="13.4" cy="9.6" r="1.5" fill="currentColor" stroke="none" />
  {:else if cuisineType === "chicken"}
    <!-- Drumstick -->
    <ellipse cx="14.2" cy="9.8" rx="6.6" ry="5.4" transform="rotate(-45 14.2 9.8)" />
    <path d="M9.8 14.2 7.4 16.6" />
    <circle cx="8.5" cy="18" r="1.9" />
    <circle cx="6" cy="15.5" r="1.9" />
  {:else if cuisineType === "fastfood"}
    <!-- Fries carton -->
    <path d="M5.4 11.6h13.2l-1.7 8.2a2.2 2.2 0 0 1-2.2 1.8H9.3a2.2 2.2 0 0 1-2.2-1.8z" />
    <path d="M8.8 11.4 7.4 5.2M12 11.2V4.2M15.2 11.4l1.4-6.2" />
  {:else if cuisineType === "halal"}
    <!-- Crescent + star -->
    <path d="M15.2 3.4C9.4 4.4 5.2 7.8 5.2 12s4.2 7.6 10 8.6C10.8 18.5 8.4 15.4 8.4 12s2.4-6.5 6.8-8.6z" />
    <path d="M17.6 8.4 18.6 11.1 21.4 11.1 19.1 12.8 20 15.5 17.6 13.8 15.2 15.5 16.1 12.8 13.8 11.1 16.6 11.1z" fill="currentColor" stroke="none" />
  {:else if cuisineType === "bbq"}
    <!-- Grill flame -->
    <path d="M12 2.6c4 3.4 6.8 6.4 6.8 10.4a6.8 6.8 0 0 1-13.6.6c0-2.3 1-4.1 2.7-5.9.5 1.6 1.4 2.5 2.5 2.7-.5-3 .1-5.2 1.6-7.8z" />
  {:else if cuisineType === "thai"}
    <!-- Chilli -->
    <path d="M4.4 19.8c6.4 1.2 11.6-3 12-9 .2-2.8-1.4-4.8-3.6-4.8-2.1 0-3.4 1.6-3.6 4-.3 3.8-2 7-4.8 9.8z" />
    <path d="M12.8 6c0-1.9 1.5-3.1 3.6-3" />
  {:else if cuisineType === "skewer"}
    <!-- Kebab skewer -->
    <path d="M12 2.2v19.6" />
    <rect x="7.2" y="5.2" width="9.6" height="3.8" rx="1.6" />
    <rect x="7.2" y="10.9" width="9.6" height="3.8" rx="1.6" />
    <rect x="7.2" y="16.6" width="9.6" height="3.8" rx="1.6" />
  {:else if cuisineType === "sandwich"}
    <!-- Cut sandwich -->
    <path d="M3.4 20h17.2L13.6 5.4a1.8 1.8 0 0 0-3.2 0z" />
    <path d="M8.6 10.6h6.8" />
    <path d="M6.6 14c1.4 1.3 2.9-1.3 4.3 0 1.5 1.3 2.9-1.3 4.3 0" />
    <path d="M4.6 17.4h14.8" />
  {:else if cuisineType === "bakery"}
    <!-- Croissant -->
    <path d="M3.8 18.2c0-6.4 3.7-11.2 8.2-11.2s8.2 4.8 8.2 11.2c-2 0-3.3-1.4-3.7-3.1-1.3 1.6-3.1 1.6-4.5 0-1.4 1.6-3.2 1.6-4.5 0-.4 1.7-1.7 3.1-3.7 3.1z" />
  {:else if cuisineType === "icecream"}
    <!-- Cone -->
    <path d="M6.6 10.4a5.4 5.4 0 0 1 10.8 0z" />
    <path d="M7.4 10.4 12 21.2l4.6-10.8" />
  {:else if cuisineType === "dessert"}
    <!-- Cupcake -->
    <path d="M5.4 13.2h13.2l-1.5 6.6a2 2 0 0 1-2 1.6H8.9a2 2 0 0 1-2-1.6z" />
    <path d="M5.4 13.2c-.5-2.4 1.3-4.1 3.2-3.8.3-2.4 2.3-4 4.5-3.6 2.1.4 3.5 2.2 3.4 4.2 1.8.3 2.8 1.9 2.1 3.2z" />
    <path d="M10.4 15.6 9.6 20.6M13.6 15.6l.8 5" />
  {:else if cuisineType === "juice"}
    <!-- Smoothie cup -->
    <path d="M6.6 10.8h10.8l-1.2 9.2a1.8 1.8 0 0 1-1.8 1.6H9.6a1.8 1.8 0 0 1-1.8-1.6z" />
    <path d="M5.8 10.8h12.4a6.2 6.2 0 0 0-12.4 0z" />
    <path d="M13.6 7 16.4 2.6" />
  {:else if cuisineType === "tea"}
    <!-- Teapot -->
    <path d="M5.6 12.8c0-3.1 2.9-5.4 6.6-5.4s6.6 2.3 6.6 5.4c0 3.4-2.4 6.2-5.6 6.2h-2c-3.2 0-5.6-2.8-5.6-6.2z" />
    <path d="M5.8 11 2.4 8.4" />
    <path d="M18.6 12.2c1.6 0 2.8 1.1 2.8 2.4s-1.2 2.4-2.8 2.4" />
    <path d="M12.2 7.4V5.8" />
    <circle cx="12.2" cy="4.6" r="1.1" fill="currentColor" stroke="none" />
  {:else if cuisineType === "wine"}
    <!-- Wine glass -->
    <path d="M7 3.4h10v4.8a5 5 0 0 1-10 0z" />
    <path d="M12 13.2v6.2" />
    <path d="M8.2 19.8h7.6" />
  {:else if cuisineType === "beer"}
    <!-- Beer mug -->
    <path d="M5.4 7.4h10.2v12.2a1.8 1.8 0 0 1-1.8 1.8H7.2a1.8 1.8 0 0 1-1.8-1.8z" />
    <path d="M15.6 10h2.4a2.6 2.6 0 0 1 0 5.2h-2.4" />
    <path d="M5.4 7.4C5.2 5.5 6.5 4.4 7.8 4.9 8.3 3.4 10.1 3.1 10.9 4.2 11.7 3.1 13.5 3.4 14 4.9 15.3 4.4 15.8 5.5 15.6 7.4Z" />
  {:else if cuisineType === "veggie"}
    <!-- Sprout -->
    <path d="M12 21.2v-9.6" />
    <path d="M12 12.4c-4.4 0-7.4-2.6-7.4-6.6 4.4 0 7.4 2.6 7.4 6.6z" />
    <path d="M12 12.4c0-4.4 2.8-7.4 6.8-7.4 0 4.4-2.8 7.4-6.8 7.4z" />
  {:else}
    <!-- Default: fork + spoon -->
    <path d="M7.6 3v6.2a2.2 2.2 0 0 0 4.4 0V3" />
    <path d="M9.8 11.4V21" />
    <path d="M16.6 3c1.9 0 3.2 1.5 3.2 3.4 0 1.7-1 3-2.3 3.4l.4 11.2h-2.6l.4-11.2c-1.3-.4-2.3-1.7-2.3-3.4C13.4 4.5 14.7 3 16.6 3z" />
  {/if}
</svg>

<style>
  .cuisine-icon {
    /* Single-ink line illustration per the R1 icon spec: stroke-only,
     * currentColor, no wash or accent hue. Solid marks (sesame, pepperoni,
     * yolk-free egg dots, star) are the same ink so the glyph stays one
     * object at 16px and reads as drawn at 64px. */
    flex-shrink: 0;
    color: var(--bg-medium-contrast);
  }
</style>
