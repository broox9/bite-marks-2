import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getPlaceAndSpotUseCase } from "$lib/glue/di-container";

function firstPublicPhoto(photos: unknown): string | null {
  if (!Array.isArray(photos)) return null;
  return photos.find(
    (photo): photo is string =>
      typeof photo === "string" && (photo.startsWith("https://") || photo.startsWith("http://")),
  ) ?? null;
}

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const useCase = getPlaceAndSpotUseCase();
  const place = await useCase.getMasterPlace(params.placeId);

  if (!place) {
    throw error(404, {
      message: "We couldn't find that spot in the Bite Marks catalog.",
    });
  }

  const isSaved = locals.user
    ? await useCase.hasUserSpot(params.placeId, locals.user.id)
    : false;

  return {
    place,
    isSaved,
    canonicalUrl: `${url.origin}${url.pathname}`,
    ogImage: firstPublicPhoto(place.photos) ?? `${url.origin}/new-bite-marks-logo.png`,
  };
};
