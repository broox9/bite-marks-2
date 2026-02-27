<script lang='ts'>
  import { Pin } from '@lucide/svelte';
  import ContainedZone from "./util/ContainedZone.svelte"

   // do these proper, don't use them directily
  import { searchForAreas } from "$lib/adapters/secondary/google/google.svelte";
  import { locationStore } from "$lib/adapters/primary/stores/location.store.svelte";
  import { transformResultToPlace } from "$lib/adapters/secondary/appwrite/dtos/placesToRecord";
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import ResultList from "./ResultList.svelte";


  console.log('[bs] LOCATIONTOOLS::STORE', locationStore)

  const data = $props()
  let locationInput = $state<string>('')
  let locationRadius = $state<number>(20)
  let locationList = $state<ResultPlaceRecord[]>([])

  async function searchHandler() {
    console.log('[bs] LOCATIONTOOLS::SEARCH HANDLER', locationInput)
    // const addy = await getLocationByAddress(locationInput)
    const resultHandler = (result: any[]) =>  {
      console.log('[bs] LOCATIONTOOLS::SEARCH RESULT', result)
      locationList = result.map(transformResultToPlace)//.filter(r => !r.primaryType)
    }
    
    // const autoCompleteRegions = await areaPlaceAutoComplete(locationInput)
    // console.log('[bs] autocomplete regions', autoCompleteRegions)
    await searchForAreas(locationInput, resultHandler)
  }

  async function selectAreaResult(selected: ResultPlaceRecord) {
    if (!selected) return
    console.log('[bs] SELECTION', JSON.stringify(selected))
    const { address, lat, lng, name, neighborhood } = selected
    locationStore.name = neighborhood ? neighborhood === name ? address : `${name}, ${neighborhood}` : address
    locationStore.center = { lat, lng }
    locationStore.radiusMiles = locationRadius;
    console.log('[bs] locationStore', locationStore)
  }

  const anchorName = '--location-search-anchor'
</script>

  <h3>Current Location</h3>
  <strong>{locationStore.name}</strong>
  
  <label for="radius">
    <div>Radius: <em>{locationRadius} miles</em></div>
    <input name="radius" id="radius" type="range" step="5" min="5" max="30" bind:value={locationRadius} aria-label="Search Radius" title="SearchRadius"/>
  </label>

    <form onsubmit={searchHandler}>
    <label for="location-search" class="ui-input-with-button" style="anchor-name: {anchorName};">
      <input type="search" name="location-search" id="location-search" placeholder="Search for a location" bind:value={locationInput}/>
      <button type="submit" aria-label="Set location" title="Set location"><Pin size={18} /></button>
    </label>
  </form>
  {#if locationList.length && locationInput.length}
    <ResultList items={locationList} onSelect={selectAreaResult} anchorName={anchorName}/>
  {/if}

  <!-- <pre>
    {JSON.stringify(locationList, null, 2)}
  </pre> -->

  <style>
    label[for="radius"] {
      margin: 0 auto;
      width: clamp(300px, 600px,50%);
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
    }
  </style>
