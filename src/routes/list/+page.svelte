<script lang="ts">
  import { Trash2, Search, X } from '@lucide/svelte';
  import { invalidateAll } from '$app/navigation';
  import { getSpots, deleteUserSpot } from '$lib/adapters/primary/remote-handlers/spots.remote';
  import PlaceSearchTool from '../../components/util/PlaceSearchTool.svelte';
  import Dialog from '../../components/util/Dialog.svelte';
  import ResultCard from '../../components/ResultCard.svelte';
  import type { ResultPlaceRecord } from '$lib/core/domain/Place/Place';


  // let spotsList :any[] = $state([])
  let showSearch = $state(false)
  const spotsQuery = getSpots({})
  let selectedResultObj = $state<ResultPlaceRecord | null>(null)

  function selectResultFn(selectedResult: ResultPlaceRecord) {
    console.log('[bs] selectResultFn', [...arguments], selectedResult)
    selectedResultObj = selectedResult
  }
  console.log('[bs] list::page::SPOTS QUERY', getSpots)

  function resultClearAction() {
    selectedResultObj = null
  }

  function resultSaveAction(result: any, selectedResult: ResultPlaceRecord) {
    console.log('[bs] resultSaveAction::page::fired', [...arguments], selectedResult)
    invalidateAll()
    resultClearAction()
  }

  function deleteSpotAction(rowId: string) {
    if (!confirm('Are you sure you want to delete this spot?')) return;
    console.log('[bs] deleteSpotAction::page::fired', [...arguments], rowId)
      deleteUserSpot(rowId)
      invalidateAll()
      resultClearAction()
  }
</script>


<div id="page-container">
  {#if showSearch}
    <section id="search-container">
      <PlaceSearchTool selectResultAction={selectResultFn} />
      <Dialog shouldModalBeOpen={!!selectedResultObj} onClose={resultClearAction}>
          {#if selectedResultObj}
              <ResultCard place={selectedResultObj} saveAction={resultSaveAction} clearAction={resultClearAction} />
          {/if}
      </Dialog>
    </section>
  {/if}

  <section id="map-container">
    OpenStreet Map here
  </section>

  <section id="spots-list">
    {#if spotsQuery.error}
      <p>Error: {spotsQuery.error}</p>
    {:else if spotsQuery.loading}
      <p>Loading...</p>
    {:else}
      {@const spotRows = spotsQuery.current?.rows ?? []}
      {#each spotRows as spot}
        <div class="p-3 flex flex-row justify-between items-center">
          <div>
            <strong>
              <a name={spot.id} aria-ignored="true"></a>
              <a href="spot/{spot.id}">{spot.name}</a>{ spot.is_visited ? '☆' : ''}
            </strong>
            <br />
            <small>{spot.address}</small>
            <br />
          </div>
          <button type="button" class="icon-button danger" onclick={() => deleteSpotAction(spot.id)}><Trash2 size={16} /></button>
        </div>
      {/each}
    {/if}

    <!-- <pre>{JSON.stringify(spotsQuery.current, null, 2)}</pre> -->
  </section>
</div>

{#if !showSearch}
  <button id="floating-search-button" type="button" class="icon-button" onclick={() => showSearch = true}><Search size={20} /></button>
{:else}
  <button id="floating-search-button" type="button" class="icon-button" onclick={() => showSearch = false}><X size={20} /></button>
{/if}


<style>
#page-container {
  display: grid;
  grid-template-areas:
    "map"
    "spots"
    "search";
  grid-template-rows: auto 1fr auto;
  /*grid-template-rows: auto 1fr;
  grid-template-columns: minmax(300px, 500px) 1fr;*/
  height: 100%;
  min-height: 0; /* Allow grid item to shrink below content size */
  /* max-height: 100svh; */
}

#search-container {
  /* grid-area: bottom-sheet; /* grid stacking */
  grid-area: unset;
  /* background-color: hsla(200, 50%, 50%, 0.25); */
  background-color: white;
  height: auto;
  padding: 0.75rem;
  border-radius: 1rem 1rem 0 0;
  transition: all 0.3s ease;
  /* transform: translateY(100%);
  &.open {
    transform: translateY(0);
  }
  &.closed {
    transform: translateY(100%);
  } */
}

#map-container {
  grid-area: map;
  background-color: hsla(100, 50%, 50%, 0.25);
}

#spots-list {
  grid-area: spots;
  overflow-y: auto;
  /* background-color: hsla(300 50% 50% / 0.1); */
  min-height: 0; /* Allow grid item to shrink below content size */
  padding-bottom: 3rem;
}

#floating-search-button {
    position: fixed;
    bottom: 1.5rem;
    right: 1rem;
    display: block;
    border-radius: 100svh;
    /* background-color: lightblue; */
    padding: 0.75rem;
    z-index: 5;
  }

@media (min-width: 768px) {
  #page-container {
    grid-template-areas:
      "spots search"
      "spots map";
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr minmax(300px, 500px);
  }

  #search-container {
    grid-area: search;
    /* place-self: end; */
  }

  #floating-search-button {
    display: none;
  }
}

</style>
