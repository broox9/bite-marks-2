import type { ConvexHttpClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { api } from "$convex/_generated/api";
import type { PersistenceRepository } from "$lib/ports/persistence.repository";
import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
import type { UserSpotRecord } from "$lib/core/domain/Spot/Spot";
import { transformResultToPlace } from "$lib/adapters/secondary/appwrite/dtos/placesToRecord";
import type { FlattenedSpot } from "$convex/spots";

function toDomainSpot(flat: FlattenedSpot): UserSpotRecord & { rowId: string; $id: string } {
  const place = flat.place;
  return {
    id: flat._id,
    $id: flat._id,
    rowId: flat._id,
    name: flat.name ?? place?.name ?? "",
    personal_rating: flat.personalRating,
    personal_notes: flat.personalNotes,
    is_visited: flat.isVisited,
    user_id: flat.userId,
    place_id: flat.placeId,
    social_links: flat.socialLinks,
    address: place?.address ?? "",
    rating: place?.rating,
    websiteURI: place?.websiteURI ?? "",
    price_level: place?.priceLevel ?? "free",
    lat: place?.lat ?? 0,
    lng: place?.lng ?? 0,
    photos: place?.photos ?? [],
    neighborhood: place?.neighborhood ?? "",
    areas: place?.areas ?? [],
    place_types: place?.placeTypes ?? [],
    primaryType: place?.primaryType,
  };
}

function toConvexPlace(place: ResultPlaceRecord | Record<string, any>) {
  const normalized = transformResultToPlace(place);
  return {
    placeId: normalized.place_id,
    name: normalized.name,
    address: normalized.address,
    rating: normalized.rating,
    websiteURI: normalized.websiteURI ?? null,
    priceLevel: normalized.price_level,
    lat: normalized.lat,
    lng: normalized.lng,
    photos: Array.isArray(normalized.photos) ? normalized.photos : [],
    neighborhood: normalized.neighborhood,
    areas: normalized.areas,
    placeTypes: normalized.place_types,
    primaryType: normalized.primaryType,
  };
}

function toDomainPlace(place: Record<string, any>) {
  return {
    id: place.placeId,
    place_id: place.placeId,
    name: place.name,
    address: place.address,
    rating: place.rating,
    websiteURI: place.websiteURI,
    price_level: place.priceLevel,
    lat: place.lat,
    lng: place.lng,
    photos: place.photos,
    neighborhood: place.neighborhood,
    areas: place.areas,
    place_types: place.placeTypes,
    primaryType: place.primaryType,
  };
}

export class ConvexAdapter implements PersistenceRepository {
  constructor(private client: ConvexHttpClient) {}

  async saveMasterPlace(document: any): Promise<any> {
    void document;
    throw new Error(
      "saveMasterPlace is not used directly; call savePlaceAndSpot instead"
    );
  }

  async saveUserSpot(_document: any): Promise<any> {
    throw new Error(
      "saveUserSpot is not used directly; call savePlaceAndSpot instead"
    );
  }

  async savePlaceAndSpot(masterPlace: any, userId: string | number) {
    const place = toConvexPlace(masterPlace);
    return this.client.mutation(api.spots.savePlaceAndSpot, {
      userId: String(userId),
      place,
    });
  }

  async getMasterPlace(id: string): Promise<any> {
    const place = await this.client.query(api.places.getByPlaceId, { placeId: id });
    return place ? toDomainPlace(place) : null;
  }

  async getUserSpot(rowId: string, userId: string): Promise<any> {
    const result = await this.client.query(api.spots.getById, {
      rowId: rowId as Id<"spots">,
      userId,
    });
    if (!result) return null;
    return toDomainSpot(result);
  }

  async getUserSpots(userId: string): Promise<any> {
    const result = await this.client.query(api.spots.listForUser, { userId });
    return {
      total: result.total,
      rows: result.rows.map(toDomainSpot),
    };
  }

  async getMasterPlaces(): Promise<any[]> {
    const places = await this.client.query(api.places.getAll, {});
    return places.map(toDomainPlace);
  }

  async hasMasterPlace(id: string): Promise<boolean> {
    return this.client.query(api.places.hasByPlaceId, { placeId: id });
  }

  async hasUserSpot(nameOrPlaceId: string, userId: string): Promise<boolean> {
    // Prefer place-id dedupe (fixes the old name-based Appwrite check).
    return this.client.query(api.spots.hasForUserPlace, {
      userId,
      placeId: nameOrPlaceId,
    });
  }

  async updateUserSpot(
    rowId: string,
    data: Partial<UserSpotRecord>,
    userId: string
  ): Promise<any> {
    const result = await this.client.mutation(api.spots.update, {
      rowId: rowId as Id<"spots">,
      userId,
      personalRating: data.personal_rating,
      personalNotes: data.personal_notes,
      isVisited: data.is_visited,
      socialLinks: data.social_links,
    });
    if (!result) return null;
    return toDomainSpot(result);
  }

  async deleteUserSpot(rowId: string, userId: string): Promise<any> {
    return this.client.mutation(api.spots.remove, {
      rowId: rowId as Id<"spots">,
      userId,
    });
  }
}
