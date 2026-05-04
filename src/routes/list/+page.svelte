<script lang="ts">
  import { Search, X } from "@lucide/svelte";
  import { invalidateAll } from "$app/navigation";
  import {
    getSpots,
    deleteUserSpot,
  } from "$lib/adapters/primary/remote-handlers/spots.remote";
  import PlaceSearchTool from "../../components/PlaceSearchTool.svelte";
  import Dialog from "../../components/util/Dialog.svelte";
  import ResultCard from "../../components/ResultCard.svelte";
  import ResultListItem from "../../components/ResultListItem.svelte";
  import SegmentedControl from "../../components/ui/SegmentedControl.svelte";
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import type { UserSpotRecord } from "$lib/core/domain/Spot/Spot";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import { MAPBOX_PUBLIC_KEY } from "$lib/constants";

  let showSearch = $state(false);
  let filterValue = $state("all");
  const spotsQuery = getSpots({});
  const spotRows = $derived(
    (spotsQuery.current?.rows ?? []) as UserSpotRecord[],
  );
  const filteredSpotRows = $derived(
    spotRows.filter((spot) => {
      if (filterValue === "visited") return spot.is_visited;
      if (filterValue === "unvisited") return !spot.is_visited;
      return true;
    }),
  );
  let selectedResultObj = $state<ResultPlaceRecord | null>(null);

  let mapContainer: HTMLElement;
  let map: mapboxgl.Map;
  let activeMarker: mapboxgl.Marker | null = null;
  let activeMapSpotId = $state<string | null>(null);

  let isMapMinimized = $state(false);
  function toggleMapMinimization() {
    isMapMinimized = !isMapMinimized;
  }

  $effect(() => {
    if (!mapContainer || map) return;

    mapboxgl.accessToken = MAPBOX_PUBLIC_KEY;
    map = new mapboxgl.Map({
      container: mapContainer,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-73.9654, 40.7829],
      zoom: 10,
    });
  });
  function selectResultFn(selectedResult: ResultPlaceRecord) {
    selectedResultObj = selectedResult;
  }

  function resultClearAction(): undefined {
    selectedResultObj = null;
    return undefined;
  }

  function resultSaveAction(
    _result: unknown,
    _selectedResult: ResultPlaceRecord,
  ): undefined {
    void invalidateAll();
    resultClearAction();
    return undefined;
  }

  async function deleteSpotAction(rowId: string) {
    if (!confirm("Delete this saved spot?")) return;
    await deleteUserSpot(rowId);
    await invalidateAll();
    resultClearAction();
  }

  function mapSpotAction(rowId: string) {
    if (activeMarker) {
      activeMarker.remove();
      activeMarker = null;
    }

    if (activeMapSpotId === rowId) {
      activeMapSpotId = null;
      return;
    }

    const spot = spotRows.find((row) => row.id === rowId);
    if (spot && map) {
      const el = document.createElement("div");
      el.className = "bite-marker-pin";

      const popup = new mapboxgl.Popup({
        offset: 12,
        closeButton: false,
        className: "bite-marker-popup",
      }).setText(spot.name);

      activeMarker = new mapboxgl.Marker({ element: el })
        .setLngLat([spot.lng, spot.lat])
        .setPopup(popup)
        .addTo(map);

      activeMarker.togglePopup();

      activeMapSpotId = rowId;
      map.flyTo({ center: [spot.lng, spot.lat], zoom: 16 });

      mapContainer?.scrollIntoView({ behavior: "smooth" });
    }
  }
</script>

<div id="page-container" data-search-open={showSearch}>
  <section
    id="search-container"
    class:open={showSearch}
    aria-label="Find and save a spot"
  >
    <div class="search-panel-header">
      <div>
        <span class="eyebrow">Add a spot</span>
        <h2>Search nearby places</h2>
      </div>
      <button
        class="search-panel-close icon-button"
        type="button"
        aria-label="Close spot search"
        onclick={() => (showSearch = false)}
      >
        <X size={18} />
      </button>
    </div>

    <PlaceSearchTool selectResultAction={selectResultFn} />
    <Dialog shouldModalBeOpen={!!selectedResultObj} onClose={resultClearAction}>
      {#if selectedResultObj}
        <ResultCard
          place={selectedResultObj}
          saveAction={resultSaveAction}
          clearAction={resultClearAction}
        />
      {/if}
    </Dialog>
  </section>

  <section
    id="map-container"
    class:minimized={isMapMinimized}
    bind:this={mapContainer}
    aria-label="Saved spots map"
  ></section>

  <section id="spots-list">
    <div id="spots-list-header">
      <div class="spots-summary">
        <span class="spot-count">{filteredSpotRows.length}</span>
        <SegmentedControl
          options={[
            { value: "all", label: "All" },
            { value: "visited", label: "Visited" },
            { value: "unvisited", label: "Unvisited" },
          ]}
          bind:selected={filterValue}
        />

        <button
          id="shrink-map-button"
          type="button"
          onclick={toggleMapMinimization}
          aria-label={isMapMinimized ? "Expand map" : "Collapse map"}
          aria-pressed={isMapMinimized}
        >
          <span class="drag-handle"></span>
        </button>
      </div>
    </div>

    {#if spotsQuery.error}
      <p class="state-message state-message-error" role="alert">
        Could not load saved spots. {spotsQuery.error}
      </p>
    {:else if spotsQuery.loading}
      <div class="spots-skeleton" aria-label="Loading saved spots">
        {#each Array(4) as _}
          <div class="skeleton-row" aria-hidden="true">
            <span></span>
            <small></small>
          </div>
        {/each}
      </div>
    {:else if filteredSpotRows.length === 0}
      <div class="state-message empty-state">
        {#if spotRows.length === 0}
          <h2>No saved spots yet</h2>
          <p>
            Search for a place, save it, and it will stay here for the next time
            you are choosing where to eat.
          </p>
          <button
            type="button"
            class="empty-state-action"
            onclick={() => (showSearch = true)}
          >
            <Search size={18} />
            Search places
          </button>
        {:else}
          <h2>No {filterValue} spots found</h2>
          <p>Try changing your filter to see your other saved spots.</p>
        {/if}
      </div>
    {:else}
      <div class="spots-stack" aria-label="Saved spots">
        {#each filteredSpotRows as spot}
          <ResultListItem
            item={spot}
            {deleteSpotAction}
            {mapSpotAction}
            isMapActive={activeMapSpotId === spot.id}
          />
        {/each}
      </div>
    {/if}
  </section>
</div>

<button
  id="floating-search-button"
  type="button"
  class="icon-button"
  aria-label={showSearch ? "Close spot search" : "Search for a spot"}
  aria-expanded={showSearch}
  aria-controls="search-container"
  onclick={() => (showSearch = !showSearch)}
>
  {#if showSearch}
    <X size={20} />
  {:else}
    <Search size={20} strokeWidth={2} />
  {/if}
</button>

<style>
  #page-container {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-height: calc(100svh - 7rem);
    color: var(--bg-high-contrast);
  }

  #search-container {
    display: none;
    background-color: var(--bg-light);
    border: 1px solid var(--bg-low-contrast);
    border-radius: var(--border-radius);
    box-shadow: 0 1rem 2rem oklch(0.35 0.02 267 / 0.18);
    padding: var(--padding-2);
    position: fixed;
    top: 4.75rem;
    left: 1rem;
    right: 1rem;
    z-index: 5;
  }

  #search-container.open {
    display: block;
  }

  .search-panel-header,
  .spots-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--padding-2);
  }

  .search-panel-header {
    margin-bottom: var(--padding-2);
  }

  .search-panel-header h2,
  .spots-summary h1 {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.2;
    letter-spacing: 0;
  }

  .eyebrow {
    display: block;
    margin-bottom: 0.125rem;
    color: var(--bg-medium-contrast);
    font-size: 0.8125rem;
    font-weight: 650;
    line-height: 1.2;
  }

  .search-panel-close,
  .empty-state-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 2.75rem;
    border: 1px solid var(--bg-low-contrast);
    border-radius: var(--border-radius);
    background-color: var(--bg-light);
    color: var(--bg-high-contrast);
  }

  .search-panel-close {
    width: 2.75rem;
    padding: 0;
  }

  #map-container {
    height: min(38svh, 24rem);
    min-height: 18rem;
    background-color: var(--accent-color-tint);
    border: 1px solid var(--bg-low-contrast);
    border-bottom: 0;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    position: relative;
    overflow: hidden;

    &.minimized {
      height: 3rem;
      min-height: 3rem;
    }
  }

  :global(.bite-marker-pin) {
    width: 1.25rem;
    height: 1.25rem;
    background-color: var(--accent-color);
    border-radius: 50%;
    border: 2px solid var(--bg-light);
    box-shadow: 0 0.125rem 0.5rem oklch(0.24 0.02 267 / 0.3);
  }

  :global(.bite-marker-popup) {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color);
    padding: 0.25rem 0.5rem;
  }

  #spots-list {
    grid-area: spots;
    position: relative;
    overflow-y: auto;
    min-height: 0;
    padding-bottom: 5rem;
    background-color: var(--bg-color);
    border: 1px solid var(--bg-low-contrast);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }

  #spots-list-header {
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    position: sticky;
    top: 0;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--padding-1);
    padding: var(--padding-2) var(--padding-2) var(--padding-1);
    background-color: oklch(from var(--bg-color) l c h / 0.96);
    border-bottom: 1px solid var(--bg-low-contrast);
  }

  .spot-count {
    border: 1px solid var(--bg-low-contrast);
    border-radius: 999px;
    background-color: var(--bg-light);
    color: var(--bg-medium-contrast);
    padding: 0.25rem 0.625rem;
    font-size: 0.8125rem;
    font-weight: 650;
  }

  #shrink-map-button {
    align-self: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 1.5rem;
    width: 5rem;
    padding: 0;
    background-color: transparent;
    border: 1px solid var(--bg-low-contrast);
    border-radius: 999px;
    box-shadow: none;
    cursor: pointer;
  }

  .drag-handle {
    display: block;
    width: 2.75rem;
    height: 0.25rem;
    border-radius: 999px;
    background-color: var(--bg-medium-contrast);
  }

  .spots-stack {
    display: flex;
    flex-direction: column;
  }

  .state-message {
    margin: var(--padding-2);
    border: 1px solid var(--bg-low-contrast);
    border-radius: var(--border-radius);
    background-color: var(--bg-light);
    padding: var(--padding-3);
    color: var(--bg-medium-contrast);
  }

  .state-message h2 {
    margin: 0 0 0.5rem;
    color: var(--bg-high-contrast);
    font-size: 1.25rem;
    letter-spacing: 0;
  }

  .state-message p {
    max-width: 38rem;
    margin: 0;
  }

  .state-message-error {
    border-color: var(--error);
    background-color: var(--error-tint);
    color: oklch(from var(--error) 0.38 calc(c * 0.85) h);
  }

  .empty-state {
    display: grid;
    justify-items: start;
    gap: var(--padding-2);
  }

  .empty-state-action {
    background-color: var(--cta-color);
    border-color: var(--cta-color);
    color: var(--bg-light);
    padding: 0 var(--padding-2);
    font-weight: 650;
  }

  .spots-skeleton {
    display: flex;
    flex-direction: column;
  }

  .skeleton-row {
    display: grid;
    gap: 0.625rem;
    padding: var(--padding-2);
    border-bottom: 1px solid var(--bg-low-contrast);
  }

  .skeleton-row span,
  .skeleton-row small {
    display: block;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--bg-light),
      var(--bg-low-contrast),
      var(--bg-light)
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.3s ease-out infinite;
  }

  .skeleton-row span {
    width: min(16rem, 72%);
    height: 1rem;
  }

  .skeleton-row small {
    width: min(24rem, 88%);
    height: 0.75rem;
  }

  #floating-search-button {
    position: fixed;
    bottom: 1.5rem;
    right: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 3rem;
    width: 3rem;
    border-radius: 100%;
    border: none;
    box-shadow: var(--cta-box-shadow);
    line-height: 1;
    background-color: var(--accent-color);
    color: var(--bg-light);
    z-index: 5;
  }

  button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px oklch(from var(--accent-color) l c h / 0.26);
  }

  @keyframes skeleton-shimmer {
    from {
      background-position: 100% 0;
    }

    to {
      background-position: -100% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-row span,
    .skeleton-row small {
      animation: none;
    }
  }

  @media (min-width: 768px) {
    #page-container {
      display: grid;
      grid-template-areas:
        "spots search"
        "spots map";
      grid-template-rows: auto 1fr;
      grid-template-columns: 1fr minmax(300px, 500px);
      gap: var(--padding-2);
      padding: var(--padding-2);
    }

    #search-container {
      display: block;
      grid-area: search;
      position: relative;
      top: auto;
      left: auto;
      right: auto;
      z-index: 1;
      box-shadow: none;
    }

    .search-panel-close {
      display: none;
    }

    #map-container {
      grid-area: map;
      height: auto;
      min-height: 24rem;
      border: 1px solid var(--bg-low-contrast);
      border-radius: var(--border-radius);
    }

    #map-container.minimized {
      min-height: 6rem;
    }

    #spots-list {
      max-height: calc(100svh - 8rem);
      border-radius: var(--border-radius);
    }

    #floating-search-button {
      display: none;
    }
  }
</style>
