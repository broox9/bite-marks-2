import localDevAdapter from "$lib/adapters/secondary/local_dev";
import appwriteAdapter from "$lib/adapters/secondary/appwrite";
import { PlaceAndSpotUseCase } from "$lib/use_cases/placeAndSpot";

// export const placeAndSpotUseCase = new PlaceAndSpotUseCase(localDevAdapter);
export const placeAndSpotUseCase = new PlaceAndSpotUseCase(appwriteAdapter);

