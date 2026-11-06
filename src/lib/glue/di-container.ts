import { createConvexHttpClient } from "@mmailaender/convex-better-auth-svelte/sveltekit";
import { ConvexAdapter } from "$lib/adapters/secondary/convex";
import { ConvexSavedLocationRepository } from "$lib/adapters/secondary/convex/savedLocations";
import type { SavedLocationRepository } from "$lib/ports/savedLocation.repository";
import { PlaceAndSpotUseCase } from "$lib/use_cases/placeAndSpot";

/** Request-scoped use case backed by the authenticated Convex client. */
export function getPlaceAndSpotUseCase() {
  return new PlaceAndSpotUseCase(new ConvexAdapter(createConvexHttpClient()));
}

/** Request-scoped saved-location repository. */
export function getSavedLocationRepository(): SavedLocationRepository {
  return new ConvexSavedLocationRepository(createConvexHttpClient());
}
