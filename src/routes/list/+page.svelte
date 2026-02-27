<script lang="ts">
  import { Trash2, Search, X } from "@lucide/svelte";
  import { invalidateAll } from "$app/navigation";
  import {
    getSpots,
    deleteUserSpot,
  } from "$lib/adapters/primary/remote-handlers/spots.remote";
  import PlaceSearchTool from "../../components/PlaceSearchTool.svelte";
  import Dialog from "../../components/util/Dialog.svelte";
  import ResultCard from "../../components/ResultCard.svelte";
  import ResultListItem from "../../components/ResultListItem.svelte";
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import { MAPBOX_PUBLIC_KEY } from "$lib/constants";
  // let spotsList :any[] = $state([])
  let showSearch = $state(false);
  const spotsQuery = getSpots({});
  let selectedResultObj = $state<ResultPlaceRecord | null>(null);

  let mapContainer: HTMLElement;
  let map: mapboxgl.Map;
  let markers: mapboxgl.Marker[] = [];

  $effect(() => {
    if (!mapContainer || map) return;

    mapboxgl.accessToken = MAPBOX_PUBLIC_KEY;
    map = new mapboxgl.Map({
      container: mapContainer,
      // style: "mapbox://styles/mapbox/dark-v11",
      // style: "mapbox://styles/mapbox/streets-v12",
      center: [-98.5795, 39.8283],
      zoom: 4,
    });
  });

  $effect(() => {
    if (!map) return;
    const spotRows = spotsQuery.current?.rows ?? [];

    // Clear old markers
    markers.forEach((m) => m.remove());
    markers = [];

    if (spotRows.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    spotRows.forEach((spot: any) => {
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.innerHTML =
        '<div style="background-color: var(--accent-color, #ff0000); width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([spot.lng, spot.lat])
        .addTo(map);

      markers.push(marker);
      bounds.extend([spot.lng, spot.lat]);
    });

    if (markers.length > 0) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  });
  function selectResultFn(selectedResult: ResultPlaceRecord) {
    console.log("[bs] selectResultFn", [...arguments], selectedResult);
    selectedResultObj = selectedResult;
  }
  console.log("[bs] list::page::SPOTS QUERY", getSpots);

  function resultClearAction() {
    selectedResultObj = null;
  }

  function resultSaveAction(result: any, selectedResult: ResultPlaceRecord) {
    console.log(
      "[bs] resultSaveAction::page::fired",
      [...arguments],
      selectedResult,
    );
    invalidateAll();
    resultClearAction();
  }

  function deleteSpotAction(rowId: string) {
    if (!confirm("Are you sure you want to delete this spot?")) return;
    console.log("[bs] deleteSpotAction::page::fired", [...arguments], rowId);
    deleteUserSpot(rowId);
    invalidateAll();
    resultClearAction();
  }

  function mapSpotAction(rowId: string) {
    console.log("[bs] mapSpotAction::page::fired", rowId);
    const spot = spotsQuery.current?.rows?.find((r: any) => r.id === rowId);
    if (spot && map) {
      map.flyTo({ center: [spot.lng, spot.lat], zoom: 16 });

      // on mobile, we might want to scroll up to the map so it's visible
      mapContainer?.scrollIntoView({ behavior: "smooth" });
    }
  }
</script>

<div id="page-container">
  {#if showSearch}
    <section id="search-container" shouldModalBeOpen={showSearch}>
      <PlaceSearchTool selectResultAction={selectResultFn} />
      <!-- this is the results dialog, not the search one -->
      <Dialog
        shouldModalBeOpen={!!selectedResultObj}
        onClose={resultClearAction}
      >
        {#if selectedResultObj}
          <ResultCard
            place={selectedResultObj}
            saveAction={resultSaveAction}
            clearAction={resultClearAction}
          />
        {/if}
      </Dialog>
    </section>
  {/if}

  <section id="map-container" bind:this={mapContainer}></section>

  <section id="spots-list">
    {#if spotsQuery.error}
      <p>Error: {spotsQuery.error}</p>
    {:else if spotsQuery.loading}
      <p>Loading...</p>
    {:else}
      {@const spotRows = spotsQuery.current?.rows ?? []}
      {#each spotRows as spot}
        <ResultListItem item={spot} {deleteSpotAction} {mapSpotAction} />
      {/each}
    {/if}

    <!-- <pre>{JSON.stringify(spotsQuery.current, null, 2)}</pre> -->
  </section>
</div>

{#if !showSearch}
  <button
    id="floating-search-button"
    type="button"
    class="icon-button"
    onclick={() => (showSearch = true)}
    ><Search size={20} strokeWidth={2} /></button
  >
{:else}
  <button
    id="floating-search-button"
    type="button"
    class="icon-button"
    onclick={() => (showSearch = false)}><X size={20} /></button
  >
{/if}

<style>
  #page-container {
    display: flex;
    flex-direction: column;
    /*display: grid;
  grid-template-areas:
    "map"
    "spots"
    "search";
  grid-template-rows: auto 1fr auto;*/
    /*grid-template-rows: auto 1fr;
  grid-template-columns: minmax(300px, 500px) 1fr;*/
    /*height: 100%;
  min-height: 0; /* Allow grid item to shrink below content size */
    /* max-height: 100svh; */
  }

  #search-container {
    /* grid-area: bottom-sheet; /* grid stacking */
    grid-area: unset;
    /* background-color: hsla(200, 50%, 50%, 0.25); */
    background-color: hsl(from var(--bg-light) h s l / 0.85);
    backdrop-filter: blur(3px);
    height: auto;
    min-height: 20rem;
    padding: 0.75rem;
    border-radius: var(--border-radius);
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    position: fixed;
    top: 3rem;
    /*bottom: 50%;*/
    left: 1rem;
    right: 1rem;
    z-index: 5;
  }

  #map-container {
    /* --base-section-color: hsla(100 50% 50% / 0.25); */
    /* grid-area: map; */
    height: 350px;
    background-color: var(--base-section-color);
    /* color: hsla(from(var(--base-section-color) h s 75% / 1)); */
    /* padding: var(--padding-2); */
    padding-bottom: var(--padding-3);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    position: relative;
    overflow: hidden;
  }

  #spots-list {
    margin-top: calc(var(--padding-1) * -1);
    grid-area: spots;
    overflow-y: auto;
    min-height: 0; /* Allow grid item to shrink below content size */
    padding-bottom: 3rem;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }

  .visited-check {
    display: inline-block;
    /*width: 1rem;
  height: 1rem;*/
    border-radius: 50%;
    color: var(--bg-low-contrast);
    margin-left: 0.5rem;
  }

  #floating-search-button {
    position: fixed;
    bottom: 1.5rem;
    right: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 42px;
    width: 42px;
    border-radius: 100%;
    border: none;
    box-shadow: var(--cta-box-shadow);
    /* background-color: lightblue; */
    line-height: 1;
    background-color: var(--accent-color);
    color: var(--bg-light);
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
