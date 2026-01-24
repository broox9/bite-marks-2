import type { MasterPlaceRecord, ResultPlaceRecord } from "$lib/the_clean/domain/Place/IPlace";
import type { UserSpotInput } from "$lib/the_clean/domain/Spot/ISpot";

export function transformResultToPlace(placeResult: google.maps.places.PlaceResult):  ResultPlaceRecord {
    const {
        id,
        displayName,
        formattedAddress,
        rating,
        websiteURI, priceLevel, location,
        addressComponents, photos, types,
        primaryType
    } = placeResult

    let neighborhood = ""
    let areas : any[] = []

    addressComponents.forEach((c: any) => {
        c.types.forEach((t: string) => {
            if (t === 'sublocality') neighborhood = c.shortText
            if (t === "neighborhood") neighborhood = c.shortText
            if (t === "sublocality_level_1") areas.push(c.shortText)
            if (t === "administrative_area_1") areas.push(c.shortText)
            if (t === "postal_code") areas.push(c.shortText)
        })
    })

    const placeRecord : ResultPlaceRecord = {
        place_id: id,
        name: displayName,
        address: formattedAddress,
        rating: rating,
        websiteURI: websiteURI,
        price_level: priceLevel,
        lat: location.lat(),
        lng: location.lng(),
        photos: [], //place.photos,
        neighborhood: neighborhood,
        place_types: types?.slice(0, -2).map((t: string) => t.replace(/_/g, " ")) || [],
        areas,
        primaryType
    }
    return placeRecord
}

type SpotAndPlace = { spotInput: UserSpotInput, placeRecord: ResultPlaceRecord }

export function transformPlaceToRecord(place: ResultPlaceRecord) : SpotAndPlace {
  console.log('[bs] convertGooglePlaceToAppwriteDoc', place)

  const placeRecord : ResultPlaceRecord = {
    place_id: place.place_id,
    name: place.name,
    address: place.address,
    rating: place.rating,
    websiteURI: place.websiteURI,
    price_level: place.price_level?.toLowerCase(),
    lat: place.lat,
    lng: place.lng,
    photos: place.photos,
    neighborhood: place.neighborhood,
    areas: place.areas,
    place_types: place.place_types,
  }

  const spotInput : UserSpotInput = {
        place_id: place.place_id,
        personal_rating: null,
        personal_notes: null,
        is_visited: false,
        user_id: "",
        social_links: [],
        notes: null,
        // createdAt: new Date().toISOString(),
        // updatedAt: new Date().toISOString(),
        // permissions: [],
    }

    return { spotInput, placeRecord  }
}
