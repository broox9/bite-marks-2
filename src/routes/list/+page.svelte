<script lang="ts">
  import {
    ChevronDown,
    ChevronUp,
    Search,
    X,
    Plus,
    Minus,
    LocateFixed,
  } from "@lucide/svelte";
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
  import type { UserSpotRecord } from "$lib/core/domain/Spot/Spot";
  import { locationStore } from "$lib/adapters/primary/stores/location.store.svelte";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import { MAPBOX_PUBLIC_KEY } from "$lib/constants";
  import { onMount } from 'svelte';

  let showSearch = $state(false);
  let listExpanded = $state(false);
  let filterValue = $state<"all" | "visited" | "unvisited">("all");
  const spotsQuery = getSpots({});
  const spotRows = $derived(
    (spotsQuery.current?.rows ?? []) as UserSpotRecord[],
  );
  const savedPlaceIds = $derived(new Set(spotRows.map((spot) => spot.place_id)));
  const visitedCount = $derived(spotRows.filter((s) => s.is_visited).length);
  const unvisitedCount = $derived(spotRows.length - visitedCount);
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
  let mapReady = $state(false);
  let markers: mapboxgl.Marker[] = [];
  let activeMapSpotId = $state<string | null>(null);
  let spotsInView = $state(0);
  let mapResizeTimer: ReturnType<typeof setTimeout> | undefined;

  const mapStyleForTheme = () =>
    document.documentElement.dataset.theme === 'night'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/streets-v12';

  onMount(() => {
    mapboxgl.accessToken = MAPBOX_PUBLIC_KEY;
    map = new mapboxgl.Map({
      container: mapContainer,
      style: mapStyleForTheme(),
      center: [locationStore.center.lng, locationStore.center.lat],
      zoom: 10,
    });
    map.on("moveend", updateSpotsInView);
    map.on("load", updateSpotsInView);
    map.on("zoom", updatePinScale);
    map.on("load", updatePinScale);
    updatePinScale();
    mapReady = true;

    let currentStyle = mapStyleForTheme();
    const themeObserver = new MutationObserver(() => {
      const nextStyle = mapStyleForTheme();
      if (nextStyle === currentStyle) return;
      currentStyle = nextStyle;
      map.setStyle(nextStyle);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      if (mapResizeTimer) clearTimeout(mapResizeTimer);
      themeObserver.disconnect();
      markers.forEach((marker) => marker.remove());
      markers = [];
      map.remove();
      mapReady = false;
    };
  });

  function updateSpotsInView() {
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    spotsInView = filteredSpotRows.filter((s) => bounds.contains([s.lng, s.lat])).length;
  }

  function updatePinScale() {
    if (!map || !mapContainer) return;
    mapContainer.dataset.pinScale = map.getZoom() < 13 ? "dot" : "label";
  }

  $effect(() => {
    if (!mapReady || !map) return;
    // Re-run whenever the filtered rows or the active spot change.
    const rows = filteredSpotRows;
    const active = activeMapSpotId;

    markers.forEach((m) => m.remove());
    markers = rows.map((spot) => {
      const el = document.createElement("div");
      el.className = "r1-pin";
      el.dataset.state = spot.id === active ? "active" : spot.is_visited ? "visited" : "default";
      el.innerHTML = `<span class="r1-pin-label">${spot.name}</span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        mapSpotAction(spot.id);
      });
      return new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([spot.lng, spot.lat])
        .addTo(map);
    });
    updateSpotsInView();
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
    showSearch = false;
    return undefined;
  }

  async function deleteSpotAction(rowId: string) {
    if (!confirm("Delete this saved spot?")) return;
    await deleteUserSpot(rowId);
    await invalidateAll();
    resultClearAction();
  }

  function mapSpotAction(rowId: string) {
    if (activeMapSpotId === rowId) {
      activeMapSpotId = null;
      return;
    }

    const spot = spotRows.find((row) => row.id === rowId);
    if (spot && map) {
      activeMapSpotId = rowId;
      map.flyTo({ center: [spot.lng, spot.lat], zoom: 15 });
    }
  }

  function zoomIn() {
    map?.zoomIn({ duration: 200 });
  }

  function zoomOut() {
    map?.zoomOut({ duration: 200 });
  }

  function locateMe() {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 13 });
    });
  }

  function toggleListExpansion() {
    listExpanded = !listExpanded;

    requestAnimationFrame(() => map?.resize());
    if (mapResizeTimer) clearTimeout(mapResizeTimer);
    mapResizeTimer = setTimeout(() => map?.resize(), 240);
  }
</script>

<div
  id="page-container"
  data-search-open={showSearch}
  data-list-expanded={listExpanded}
>
  <section id="map-section" aria-label="Saved spots map">
    <div id="map-container" bind:this={mapContainer}></div>

    <div class="location-pill">
      <span class="location-dot"></span>
      {locationStore.name} · {locationStore.radiusMiles} mi
    </div>

    <div class="map-controls">
      <button type="button" onclick={zoomIn} aria-label="Zoom in"><Plus size={15} /></button>
      <button type="button" onclick={zoomOut} aria-label="Zoom out"><Minus size={15} /></button>
      <button type="button" class="locate-btn" onclick={locateMe} aria-label="Use my location"
        ><LocateFixed size={15} /></button
      >
    </div>

    <div class="in-view-chip">{spotsInView} spot{spotsInView === 1 ? "" : "s"} in view</div>

    <button
      id="search-fab"
      type="button"
      aria-label={showSearch ? "Close spot search" : "Search for a spot"}
      aria-expanded={showSearch}
      aria-controls="search-container"
      onclick={() => (showSearch = !showSearch)}
    >
      {#if showSearch}
        <X size={22} />
      {:else}
        <Search size={22} strokeWidth={2} />
      {/if}
    </button>
  </section>

  <section id="spots-panel">
    {#if listExpanded}
      <div class="list-grab-handle" aria-hidden="true"></div>
    {/if}
    <div class="filter-toolbar">
      <div class="filter-tabs" role="tablist" aria-label="Filter spots">
        <button
          type="button"
          class="filter-tab"
          class:active={filterValue === "all"}
          onclick={() => (filterValue = "all")}
          role="tab"
          aria-selected={filterValue === "all"}
        >
          All <span class="tab-count">{spotRows.length}</span>
        </button>
        <button
          type="button"
          class="filter-tab"
          class:active={filterValue === "visited"}
          onclick={() => (filterValue = "visited")}
          role="tab"
          aria-selected={filterValue === "visited"}
        >
          Visited <span class="tab-count">{visitedCount}</span>
        </button>
        <button
          type="button"
          class="filter-tab"
          class:active={filterValue === "unvisited"}
          onclick={() => (filterValue = "unvisited")}
          role="tab"
          aria-selected={filterValue === "unvisited"}
        >
          To try <span class="tab-count">{unvisitedCount}</span>
        </button>
      </div>
      <button
        type="button"
        class="list-rollup-button"
        class:active={listExpanded}
        aria-label={listExpanded ? 'Show map' : 'Expand list'}
        aria-pressed={listExpanded}
        aria-controls="map-section spots-panel"
        title={listExpanded ? 'Show map' : 'Expand list'}
        onclick={toggleListExpansion}
      >
        {#if listExpanded}
          <ChevronDown size={17} strokeWidth={2.2} />
        {:else}
          <ChevronUp size={17} strokeWidth={2.2} />
        {/if}
      </button>
    </div>

    <div class="spots-scroll">
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
    </div>
  </section>

  <div class="drawer-scrim" onclick={() => (showSearch = false)} aria-hidden="true"></div>

  <section
    id="search-container"
    class:open={showSearch}
    aria-label="Find and save a spot"
  >
    <div class="grab-handle"></div>
    <div class="search-panel-header">
      <h2>Add a spot</h2>
      <button
        class="search-panel-close icon-button"
        type="button"
        aria-label="Close spot search"
        onclick={() => (showSearch = false)}
      >
        <X size={18} />
      </button>
    </div>

    <PlaceSearchTool selectResultAction={selectResultFn} {savedPlaceIds} />
    <Dialog title="Add a spot" shouldModalBeOpen={!!selectedResultObj} onClose={resultClearAction}>
      {#if selectedResultObj}
        <ResultCard
          place={selectedResultObj}
          saveAction={resultSaveAction}
          clearAction={resultClearAction}
        />
      {/if}
    </Dialog>
  </section>
</div>

<style>
  #page-container {
    position: relative;
    display: flex;
    flex-direction: column;
    height: calc(100svh - 3.6875rem);
    height: calc(100dvh - 3.6875rem);
    overflow: hidden;
    color: var(--sys-color-text);
  }

  #map-section {
    position: relative;
    flex: 0 0 42%;
    border-bottom: 1px solid var(--sys-color-border);
    transition: flex-basis 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }

  #map-container {
    position: absolute;
    inset: 0;
    /* Clip map tiles and markers, but let the search button cross the panel edge. */
    overflow: hidden;
    border-radius: inherit;
  }

  .location-pill {
    position: absolute;
    top: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    gap: 0.4375rem;
    background-color: var(--comp-location-bg);
    border: 1px solid var(--comp-location-border);
    border-radius: var(--comp-location-radius);
    padding: var(--comp-location-padding);
    color: var(--sys-color-text);
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: var(--ref-shadow-md);
    white-space: nowrap;
    z-index: 2;
  }

  .location-dot {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 999px;
    background-color: var(--sys-color-brand);
    flex-shrink: 0;
  }

  .map-controls {
    position: absolute;
    top: 3.25rem;
    right: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    z-index: 2;
  }

  .map-controls button {
    width: 2.125rem;
    height: 2.125rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-surface);
    color: var(--sys-color-text-muted);
    box-shadow: var(--ref-shadow-sm);
    cursor: pointer;
  }

  .map-controls .locate-btn {
    color: var(--sys-color-brand);
  }

  .in-view-chip {
    position: absolute;
    left: 0.75rem;
    bottom: 0.75rem;
    background-color: var(--comp-map-count-bg);
    color: var(--comp-map-count-text);
    border-radius: var(--comp-map-count-radius);
    padding: var(--comp-map-count-padding);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    z-index: 2;
  }

  #search-fab {
    position: absolute;
    right: calc(1.125rem + 2.75rem + 0.75rem);
    bottom: -1.5rem;
    width: var(--comp-fab-size);
    height: var(--comp-fab-size);
    border: none;
    border-radius: 999px;
    background-color: var(--comp-fab-bg);
    color: var(--comp-fab-text);
    box-shadow: var(--comp-fab-shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 5;
  }

  #spots-panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background-color: var(--sys-color-page);
  }

  .filter-toolbar {
    display: flex;
    align-items: center;
    gap: var(--comp-pill-gap);
    /* Reserve room for the lower half of the floating search button. */
    padding: calc(var(--comp-fab-size) / 2 + 0.5rem) 1.125rem 0.625rem;
    flex-shrink: 0;
  }

  .filter-tabs {
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--comp-pill-gap);
  }

  .filter-tab {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    background-color: var(--comp-pill-unselected-bg);
    border: 1px solid var(--comp-pill-unselected-border);
    color: var(--comp-pill-unselected-text);
    border-radius: var(--comp-pill-radius);
    padding: var(--comp-pill-padding-block) var(--comp-pill-padding-inline);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }

  .filter-tab.active {
    background-color: var(--comp-pill-selected-bg);
    border-color: var(--comp-pill-selected-border);
    color: var(--comp-pill-selected-text);
  }

  .tab-count {
    font-variant-numeric: tabular-nums;
    opacity: 0.65;
    font-size: 0.75rem;
  }

  .list-rollup-button {
    display: inline-grid;
    width: 2rem;
    min-width: 2rem;
    height: 2rem;
    margin-left: auto;
    place-items: center;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    background: transparent;
    color: var(--sys-color-text-muted);
    cursor: pointer;
  }

  .list-rollup-button.active {
    border-color: var(--sys-color-text);
    background: var(--sys-color-text);
    color: var(--sys-color-text-on-dark);
  }

  .list-grab-handle {
    width: 2.25rem;
    height: 0.25rem;
    flex: 0 0 auto;
    align-self: center;
    margin: 0.5rem 0 -0.125rem;
    border-radius: 999px;
    background: var(--sys-color-border-strong);
  }

  .spots-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .spots-stack {
    display: flex;
    flex-direction: column;
  }

  .search-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--padding-2);
    margin-bottom: var(--padding-1);
    padding: 0 1.125rem;
  }

  .search-panel-header h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .search-panel-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    min-height: 2.25rem;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-surface);
    color: var(--sys-color-text);
  }

  .drawer-scrim {
    position: fixed;
    inset: 0;
    background-color: var(--comp-drawer-backdrop);
    opacity: 0;
    pointer-events: none;
    transition: opacity 220ms ease;
    z-index: 8;
  }

  #page-container[data-search-open="true"] .drawer-scrim {
    opacity: 1;
    pointer-events: auto;
  }

  #search-container {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    background-color: var(--comp-drawer-bg);
    border-radius: var(--comp-drawer-radius) var(--comp-drawer-radius) 0 0;
    box-shadow: var(--comp-drawer-shadow);
    padding: 0.625rem 0 1.25rem;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 76%;
    overflow-y: auto;
    transform: translateY(100%);
    transition: transform 260ms cubic-bezier(0.2, 0.7, 0.2, 1.05);
    z-index: 9;
  }

  #search-container.open {
    transform: translateY(0);
  }

  .grab-handle {
    width: 2.25rem;
    height: 0.25rem;
    border-radius: 999px;
    background-color: var(--sys-color-border-strong);
    align-self: center;
    margin-bottom: 0.25rem;
    flex-shrink: 0;
  }

  #search-container :global(.search-drawer) {
    padding-left: 1.125rem;
    padding-right: 1.125rem;
  }

  .empty-state-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 2.75rem;
    border: 1px solid var(--comp-btn-primary-border);
    border-radius: var(--comp-btn-primary-radius);
    background-color: var(--comp-btn-primary-bg);
    color: var(--comp-btn-primary-text);
    padding: 0 var(--padding-2);
    font-weight: 650;
  }

  .state-message {
    margin: var(--padding-2);
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-surface-raised);
    padding: var(--padding-3);
    color: var(--sys-color-text-muted);
  }

  .state-message h2 {
    margin: 0 0 0.5rem;
    color: var(--sys-color-text);
    font-size: 1.25rem;
    letter-spacing: 0;
  }

  .state-message p {
    max-width: 38rem;
    margin: 0;
  }

  .state-message-error {
    border-color: var(--sys-color-error);
    background-color: var(--sys-color-error-tint);
    color: var(--sys-color-error-text);
  }

  .empty-state {
    display: grid;
    justify-items: start;
    gap: var(--padding-2);
  }

  .spots-skeleton {
    display: flex;
    flex-direction: column;
  }

  .skeleton-row {
    display: grid;
    gap: 0.625rem;
    padding: var(--padding-2);
    border-bottom: 1px solid var(--sys-color-border);
  }

  .skeleton-row span,
  .skeleton-row small {
    display: block;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--sys-color-surface-raised),
      var(--sys-color-surface-sunken),
      var(--sys-color-surface-raised)
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

  button:focus-visible {
    outline: none;
    box-shadow: var(--comp-focus-ring);
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
    .skeleton-row small,
    #search-container,
    .drawer-scrim,
    #map-section {
      animation: none;
      transition-duration: 120ms;
    }
  }

  @media (max-width: 767px) {
    #page-container[data-list-expanded="true"] #map-section {
      flex-basis: 3.25rem;
    }

    #page-container[data-list-expanded="true"] #spots-panel {
      position: relative;
      z-index: 4;
      border-radius: var(--sys-radius-2xl) var(--sys-radius-2xl) 0 0;
      box-shadow: var(--comp-drawer-shadow);
    }

    #page-container[data-list-expanded="true"] .location-pill,
    #page-container[data-list-expanded="true"] .map-controls,
    #page-container[data-list-expanded="true"] .in-view-chip {
      opacity: 0;
      pointer-events: none;
    }
  }

  @media (min-width: 768px) {
    #page-container {
      display: grid;
      grid-template-areas:
        "spots search"
        "spots map";
      grid-template-rows: auto 1fr;
      grid-template-columns: 1fr minmax(320px, 480px);
      gap: var(--padding-2);
      padding: var(--padding-2);
      height: auto;
      min-height: calc(100svh - 7rem);
      overflow: visible;
    }

    #map-section {
      grid-area: map;
      flex-basis: auto;
      height: auto;
      min-height: 22rem;
      border: 1px solid var(--sys-color-border);
      border-bottom: 1px solid var(--sys-color-border);
      border-radius: var(--sys-radius-control);
    }

    #search-fab {
      display: none;
    }

    .list-rollup-button,
    .list-grab-handle {
      display: none;
    }

    .filter-toolbar {
      padding-top: 1.125rem;
    }

    #spots-panel {
      grid-area: spots;
      max-height: calc(100svh - 8rem);
      border: 1px solid var(--sys-color-border);
      border-radius: var(--sys-radius-control);
    }

    .drawer-scrim {
      display: none;
    }

    #search-container {
      grid-area: search;
      position: relative;
      inset: auto;
      height: auto;
      transform: none;
      border-radius: var(--sys-radius-control);
      box-shadow: none;
      border: 1px solid var(--sys-color-border);
      padding: var(--padding-2);
    }

    .grab-handle {
      display: none;
    }

    .search-panel-header,
    #search-container :global(.search-drawer) {
      padding-left: 0;
      padding-right: 0;
    }

    .search-panel-close {
      display: none;
    }
  }
</style>
