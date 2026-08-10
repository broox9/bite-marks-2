import { getPlaceAndSpotUseCase } from "$lib/glue/di-container";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const masterPlaces = await getPlaceAndSpotUseCase().getAllMasterPlaces();
  console.log("[bs] adapter::getAllMasterPlaces::masterPlaces", masterPlaces);
  return {
    masterPlaces,
  };
};
