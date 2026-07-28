import { env } from "$env/dynamic/private";
import { createConvexHttpClient } from "@mmailaender/convex-better-auth-svelte/sveltekit";
import appwriteAdapter from "$lib/adapters/secondary/appwrite";
import { ConvexAdapter } from "$lib/adapters/secondary/convex";
import { PlaceAndSpotUseCase } from "$lib/use_cases/placeAndSpot";

function useConvex(): boolean {
  return env.USE_CONVEX === "1" || env.USE_CONVEX === "true";
}

/** Request-scoped use case. Prefer this over the legacy module singleton. */
export function getPlaceAndSpotUseCase() {
  if (useConvex()) {
    return new PlaceAndSpotUseCase(new ConvexAdapter(createConvexHttpClient()));
  }
  return new PlaceAndSpotUseCase(appwriteAdapter);
}

/**
 * @deprecated Module singleton — only safe while USE_CONVEX is off (Appwrite admin client).
 * Remote handlers should call getPlaceAndSpotUseCase() instead.
 */
export const placeAndSpotUseCase = new PlaceAndSpotUseCase(appwriteAdapter);
