
import { searchForPlaces, nearbySearch, placeAutoComplete } from "../../infrastructure/services/google.svelte";
import { transformPlaceToRecord, transformResultToPlace} from "../../interface-adapters/presenters/resultToPlacePresenter";
import type { ResultPlaceRecord } from "$lib/the_clean/domain/Place/IPlace";

import { saveSpotInputAdapter } from "../../interface-adapters/adapters/saveSpotInput";

import { placesResultListUseCase } from "../use-cases/placesResultListUseCase";
import { saveSpotUseCase } from "../use-cases/saveSpotUseCase";

type SearchType = 'places' | 'nearby'

type ResultListParams = {
    value: string,
    type: SearchType,
    callback: (spots: ResultPlaceRecord[]) => void
}

export async function resultsListController(params: ResultListParams) {
  const { callback, type, value } = params

  try {
    const placesPromise = placeAutoComplete(value)
    await placesResultListUseCase({searchPromise: placesPromise, presenter: transformResultToPlace, callback})
  } catch (error) {
    console.error(error)
    callback([])
  }
}

export async function selectResultController(resultInput: ResultPlaceRecord, callback: (label: string, payload: any) => void) {
    console.log('[bs] controller::SELECTED SPOT', resultInput)
    console.dir(resultInput)
    await saveSpotUseCase({spot: resultInput, adapter: saveSpotInputAdapter, presenter: transformPlaceToRecord, callback})
}