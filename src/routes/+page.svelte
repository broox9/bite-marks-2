<script lang="ts">
// import { resultsListController, selectResultController } from '$lib/application/controllers/results.controller';
import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
import { saveSpot } from '$lib/adapters/primary/remote-handlers/spots.remote';
import { locationStore } from '$lib/adapters/primary/stores/location.store.svelte';
import ContainedZone from '../components/util/ContainedZone.svelte';
import ResultCard from '../components/ResultCard.svelte';
import ResultList from '../components/ResultList.svelte';
import Dialog from '../components/util/Dialog.svelte'
import LocationTools from '../components/LocationTools.svelte';
import PlaceSearchTool from '../components/PlaceSearchTool.svelte';

// let currentSearchValue = $state('')
// let resultList = $state<ResultPlaceRecord[] | []>([])
let selectedResult = $state<ResultPlaceRecord | null>(null)
// console.log('[bs] page::HOME', locationStore)

// const resultHandler = (results  : ResultPlaceRecord[]) => {
//     resultList = results
// }

// async function searchHandler(e: HTMLInputElement) {
//     const value = e?.target?.value;
//     if (!value || value.length < 3) {
//         resultList = [];
//         return
//     }
//     await resultsListController({value, type: 'places', callback: resultHandler})
// }

// function callback (stuff: any) {
//     console.log('[bs] CALLBACK', stuff)
//     console.dir(stuff)
//     resultClearAction()
//     // listClearAction()
// }

function selectResult(selectedPlace: ResultPlaceRecord) {
    selectedResult = selectedPlace
    // resultSaveAction(selectedPlace, callback)
    // selectResultController(selectedPlace, callback)
}

function resultSaveAction(result: any, selectedResult: ResultPlaceRecord) {
  console.log('[bs] resultSaveAction', [...arguments], selectedResult)
    // selectResultController(selectedResult, () => undefined)
    // saveSpot({ spot: selectedResult }) // this happens in the ResultCard component
}

function resultClearAction() {
    selectedResult = null
}

// function listClearAction() {
//     selectedResult = null
//     resultList = []
//     currentSearchValue = ''
// }
</script>


<ContainedZone>
    <section id="location-tools-container">
        <LocationTools />
        <PlaceSearchTool selectResultAction={selectResult} />
     </section>
    <!-- <label>
        <span class="flex flex-row justify-between items-center">
            Search
            <button type="button" class="clear" onclick={listClearAction}>Clear list</button>
        </span>
        <input
            type="search"
            id="search"
            bind:value={currentSearchValue}
            oninput={searchHandler}
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="results-list"
            aria-expanded={!!resultList.length}
        />
    </label> -->

    <!-- TODO: make this clickable -->
    <!-- <section class='mt-4'>
        {#if resultList.length > 0}
            <ResultList items={resultList} onSelect={selectResult}/>
        {/if}
    </section> -->


    <Dialog shouldModalBeOpen={!!selectedResult} onClose={resultClearAction}>
        {#if selectedResult}
            <ResultCard place={selectedResult} saveAction={resultSaveAction} clearAction={resultClearAction} />
        {/if}
    </Dialog>
</ContainedZone>


<style>
    #location-tools-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0.25rem;
        /* min-width: 350px; */
        max-width: 800px;
        margin: 0 auto;
    }
</style>
