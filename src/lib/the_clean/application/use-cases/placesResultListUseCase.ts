import type { ResultPlaceRecord } from "../../domain/Place/IPlace";

type PlacesResultParams = {
  searchPromise: Promise<google.maps.places.PlaceResult[] | []>
  presenter: (placeResult: google.maps.places.PlaceResult) => ResultPlaceRecord
  callback: (placeList: ResultPlaceRecord[]) => void
}

export async function placesResultListUseCase({ searchPromise, presenter, callback }: PlacesResultParams) {
  try {
    const placeResults = await searchPromise
    const placesList  = placeResults.map(presenter)
    callback(placesList)
  } catch (error) {
    console.error(error)
    callback([])
  }
}   