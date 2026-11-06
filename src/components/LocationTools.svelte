<script lang="ts">
  import { LocateFixed, Pin, Search } from '@lucide/svelte';
  import { onDestroy } from 'svelte';
  import { searchForAreas } from '$lib/adapters/secondary/google/google.svelte';
  import { locationStore } from '$lib/adapters/primary/stores/location.store.svelte';
  import { transformResultToPlace } from '$lib/adapters/secondary/appwrite/dtos/placesToRecord';
  import type { ResultPlaceRecord } from '$lib/core/domain/Place/Place';
  import type { ActiveLocation } from '$lib/core/domain/Location/Location';
  import { MIN_RADIUS_MILES, MAX_RADIUS_MILES } from '$lib/core/domain/Location/limits';
  import ResultList from './ResultList.svelte';

  let {
    showHeading = true,
    showRadius = true,
    showCurrentLocation = false,
    onLocationChange,
  }: {
    showHeading?: boolean;
    showRadius?: boolean;
    showCurrentLocation?: boolean;
    onLocationChange?: (location: ActiveLocation) => void;
  } = $props();

  const id = $props.id();
  let locationInput = $state('');
  let locationList = $state<ResultPlaceRecord[]>([]);
  let isSearching = $state(false);
  let hasSearched = $state(false);
  let searchError = $state<string | null>(null);
  let isLocating = $state(false);
  let locateError = $state<string | null>(null);
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  let searchVersion = 0;
  let selectionVersion = 0;

  function cancelSearch() {
    clearTimeout(searchTimer);
    searchVersion++;
    locationList = [];
    isSearching = false;
    hasSearched = false;
    searchError = null;
  }

  function searchHandler(immediate = false) {
    cancelSearch();
    const query = locationInput.trim();
    if (query.length < 3) return;
    const version = searchVersion;
    isSearching = true;
    if (immediate) void search(query, version);
    else searchTimer = setTimeout(() => void search(query, version), 250);
  }

  async function search(query: string, version: number) {
    try {
      await searchForAreas(query, (results) => {
        if (version !== searchVersion) return;
        locationList = (results ?? []).map(transformResultToPlace);
        hasSearched = true;
      });
    } catch {
      if (version === searchVersion) searchError = 'Could not search for locations. Please try again.';
    } finally {
      if (version === searchVersion) isSearching = false;
    }
  }

  function changeLocation(location: Omit<ActiveLocation, 'radiusMiles'>) {
    selectionVersion++;
    isLocating = false;
    locateError = null;
    cancelSearch();
    locationInput = '';
    locationStore.setActive(location);
    onLocationChange?.(locationStore.snapshot);
  }

  function selectAreaResult(selected: ResultPlaceRecord) {
    const { address, lat, lng, name, neighborhood } = selected;
    changeLocation({
      name: (neighborhood && neighborhood !== name ? `${name}, ${neighborhood}` : address) || name,
      center: { lat, lng },
      savedLocationId: null,
    });
  }

  function useCurrentLocation() {
    locateError = null;
    if (!navigator.geolocation) {
      locateError = 'Geolocation is not available in this browser.';
      return;
    }
    const version = ++selectionVersion;
    isLocating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (version !== selectionVersion) return;
        changeLocation({
          name: 'Current location',
          center: { lat: position.coords.latitude, lng: position.coords.longitude },
          savedLocationId: null,
        });
      },
      () => {
        if (version !== selectionVersion) return;
        locateError = 'Could not get your location. Check location permissions and try again.';
        isLocating = false;
      },
      { timeout: 10000 },
    );
  }

  onDestroy(() => {
    clearTimeout(searchTimer);
    searchVersion++;
    selectionVersion++;
  });
</script>

<div class="location-tools">
  {#if showHeading}
    <div class="current-location">
      <h3>Current Location</h3>
      <strong>{locationStore.name}</strong>
    </div>
  {/if}

  {#if showRadius}
    <label class="radius-field" for={`${id}-radius`}>
      <span>Radius: <em>{locationStore.radiusMiles} miles</em></span>
      <input
        id={`${id}-radius`}
        type="range"
        step="1"
        min={MIN_RADIUS_MILES}
        max={MAX_RADIUS_MILES}
        bind:value={locationStore.radiusMiles}
        aria-label="Search radius in miles"
      />
    </label>
  {/if}

  {#if showCurrentLocation}
    <button type="button" class="use-current-btn" onclick={useCurrentLocation} disabled={isLocating}>
      <LocateFixed size={14} aria-hidden="true" />
      {isLocating ? 'Locating…' : 'Use current location'}
    </button>
  {/if}
  {#if locateError}<p class="field-error" role="alert">{locateError}</p>{/if}

  <form
    role="search"
    aria-label="Location search"
    onsubmit={(event) => {
      event.preventDefault();
      searchHandler(true);
    }}
  >
    <label class="search-field">
      <Search size={15} aria-hidden="true" />
      <input
        type="search"
        aria-label="Search for a location"
        placeholder="Search for a location"
        bind:value={locationInput}
        oninput={() => searchHandler()}
        autocomplete="off"
      />
      <button type="submit" aria-label="Search locations" title="Search locations">
        <Pin size={18} aria-hidden="true" />
      </button>
    </label>
  </form>
  {#if isSearching}<p class="status" role="status">Searching…</p>{/if}
  {#if searchError}<p class="field-error" role="alert">{searchError}</p>{/if}
  {#if locationList.length}
    <ResultList items={locationList} onSelect={selectAreaResult} query={locationInput.trim()} />
  {:else if hasSearched && !isSearching && !searchError}
    <p class="status" role="status">No locations found. Try another search.</p>
  {/if}
</div>

<style>
  .location-tools {
    display: grid;
    gap: 0.75rem;
    min-width: 0;
    text-align: left;
  }

  .current-location {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  h3 {
    margin: 0 0 0.375rem;
  }

  .radius-field {
    display: grid;
    gap: 0.5rem;
    cursor: pointer;
  }

  .radius-field input {
    width: 100%;
    min-width: 0;
    margin: 0;
    accent-color: var(--sys-color-brand);
  }

  .search-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    min-height: 2.75rem;
    padding: 0 0.75rem;
    border: 1px solid transparent;
    border-radius: var(--comp-input-search-radius);
    background: var(--comp-input-search-bg);
    color: var(--sys-color-text-muted);
  }

  .search-field:focus-within {
    border-color: var(--sys-color-accent);
    box-shadow: var(--comp-focus-ring);
  }

  .search-field input {
    flex: 1;
    min-width: 0;
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--sys-color-text);
    font: inherit;
  }

  .search-field input::placeholder {
    color: var(--sys-color-text-muted);
  }

  .search-field button {
    display: inline-grid;
    place-items: center;
    flex-shrink: 0;
    min-width: 2.75rem;
    min-height: 2.75rem;
    border: none;
    background: transparent;
    color: var(--sys-color-brand);
    cursor: pointer;
  }

  .use-current-btn {
    display: inline-flex;
    align-items: center;
    justify-self: start;
    gap: 0.375rem;
    min-height: 2.75rem;
    padding: 0.375rem 0.625rem;
    border: 1px solid var(--sys-color-brand);
    border-radius: var(--sys-radius-control);
    background: transparent;
    color: var(--sys-color-brand);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }

  .use-current-btn:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  button:focus-visible {
    outline: none;
    box-shadow: var(--comp-focus-ring);
  }

  .status,
  .field-error {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--sys-color-text-muted);
  }

  .field-error {
    color: var(--sys-color-error-text);
  }

  .location-tools :global(.result-name),
  .location-tools :global(.result-sub) {
    overflow-wrap: anywhere;
  }
</style>
