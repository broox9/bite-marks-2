import { placeAndSpotUseCase } from "$lib/glue/di-container";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const masterPlaces = await placeAndSpotUseCase.getAllMasterPlaces();
  console.log("[bs] adapter::getAllMasterPlaces::masterPlaces", masterPlaces);
  return {
    masterPlaces,
  };
};
