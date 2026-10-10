<script lang="ts">
  import {
    Bookmark,
    LocateFixed,
    LogOut,
    MapPin,
    Monitor,
    Moon,
    Pencil,
    RotateCcw,
    Search,
    Star,
    Sun,
    Trash2,
  } from '@lucide/svelte';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { authClient } from '$lib/auth-client';
  import { locationStore } from '$lib/adapters/primary/stores/location.store.svelte';
  import {
    createSavedLocation,
    deleteSavedLocation,
    listSavedLocations,
    setDefaultSavedLocation,
    updateSavedLocation,
  } from '$lib/adapters/primary/remote-handlers/savedLocations.remote';
  import { searchForAreas } from '$lib/adapters/secondary/google/google.svelte';
  import { transformResultToPlace } from '$lib/adapters/secondary/appwrite/dtos/placesToRecord';
  import type { ResultPlaceRecord } from '$lib/core/domain/Place/Place';
  import {
    activeLocationFromSaved,
    findDefaultLocation,
    findSavedLocationWithChangedRadius,
    type SavedLocation,
  } from '$lib/core/domain/Location/Location';
  import {
    MAX_LOCATION_NAME_LENGTH,
    MAX_RADIUS_MILES,
    MAX_SAVED_LOCATIONS,
    MIN_RADIUS_MILES,
  } from '$lib/core/domain/Location/limits';
  import {
    readThemePreference,
    saveThemePreference,
    type ThemePreference,
  } from '$lib/theme';
  import ResultList from '../../components/ResultList.svelte';

  type ActionSection = 'active' | 'radius' | 'saved';

  const user = $derived(page.data.user as { id: string; email?: string | null; name?: string | null } | null);

  let locationInput = $state('');
  let locationResults = $state<ResultPlaceRecord[]>([]);
  let isLocating = $state(false);
  let locateError = $state<string | null>(null);
  let themePreference = $state<ThemePreference>('system');

  // Settings is behind auth (see +layout.server.ts), so a user is always present here.
  const savedLocationsQuery = $derived(listSavedLocations({ userId: user!.id }));
  const savedLocationsLoaded = $derived(savedLocationsQuery.current !== undefined);
  const savedLocationsError = $derived(
    savedLocationsQuery.error !== undefined && savedLocationsQuery.current === undefined,
  );
  let isRetryingSavedLocations = $state(false);

  async function retrySavedLocations() {
    isRetryingSavedLocations = true;
    try {
      await savedLocationsQuery.refresh();
    } catch (error) {
      console.error('[bs] SETTINGS::retrySavedLocations', error);
    } finally {
      isRetryingSavedLocations = false;
    }
  }
  const savedLocations = $derived<SavedLocation[]>(savedLocationsQuery.current ?? []);
  const defaultLocation = $derived(findDefaultLocation(savedLocations));
  const activeSavedLocation = $derived(
    savedLocations.find((location) => location.id === locationStore.savedLocationId) ?? null,
  );
  const locationWithChangedRadius = $derived(
    findSavedLocationWithChangedRadius(locationStore.snapshot, savedLocations),
  );
  const isAtLocationLimit = $derived(savedLocations.length >= MAX_SAVED_LOCATIONS);
  const locationLimitMessage = `You can save up to ${MAX_SAVED_LOCATIONS} locations. Delete one to save another.`;

  let saveNameDraft = $state<string | null>(null);
  const saveName = $derived(
    (saveNameDraft ?? locationStore.name).slice(0, MAX_LOCATION_NAME_LENGTH),
  );
  let renamingId = $state<string | null>(null);
  let renameDraft = $state('');
  let pendingAction = $state<string | null>(null);
  let actionError = $state<{ section: ActionSection; message: string } | null>(null);

  onMount(() => {
    themePreference = readThemePreference(localStorage);
  });

  function chooseTheme(preference: ThemePreference) {
    themePreference = preference;
    saveThemePreference(preference);
  }

  async function searchHandler(e: Event) {
    const value = (e.currentTarget as HTMLInputElement | null)?.value;
    if (!value || value.length < 3) {
      locationResults = [];
      return;
    }
    await searchForAreas(value, (results) => {
      locationResults = results.map(transformResultToPlace);
    });
  }

  function selectAreaResult(selected: ResultPlaceRecord) {
    if (!selected) return;
    const { address, lat, lng, name, neighborhood } = selected;
    locationStore.setActive({
      name: neighborhood
        ? neighborhood === name
          ? address
          : `${name}, ${neighborhood}`
        : address,
      center: { lat, lng },
      savedLocationId: null,
    });
    saveNameDraft = null;
    locationInput = '';
    locationResults = [];
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      locateError = 'Geolocation is not available in this browser.';
      return;
    }
    isLocating = true;
    locateError = null;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationStore.setActive({
          name: 'Current location',
          center: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          savedLocationId: null,
        });
        saveNameDraft = null;
        isLocating = false;
      },
      () => {
        locateError = 'Could not get your location.';
        isLocating = false;
      },
    );
  }

  async function runLocationAction(
    action: string,
    section: ActionSection,
    perform: () => Promise<string | void>,
  ) {
    pendingAction = action;
    actionError = null;
    try {
      const message = await perform();
      if (message) actionError = { section, message };
      await savedLocationsQuery.refresh();
    } catch (error) {
      console.error('[bs] SETTINGS::location action', action, error);
      actionError = { section, message: 'Something went wrong. Please try again.' };
    } finally {
      pendingAction = null;
    }
  }

  function saveActiveLocation() {
    const name = saveName.trim();
    if (!name) {
      actionError = { section: 'active', message: 'Give this location a name.' };
      return;
    }
    const { center, radiusMiles } = locationStore;
    return runLocationAction('save', 'active', async () => {
      const result = await createSavedLocation({
        name,
        lat: center.lat,
        lng: center.lng,
        radiusMiles,
      });
      if (!result.success) return result.error;
      locationStore.setActive(activeLocationFromSaved(result.location));
      saveNameDraft = null;
    });
  }

  function useSavedLocation(location: SavedLocation) {
    locationStore.setActive(activeLocationFromSaved(location));
  }

  function saveChangedRadius(location: SavedLocation) {
    const radiusMiles = locationStore.radiusMiles;
    return runLocationAction(`radius:${location.id}`, 'radius', async () => {
      await updateSavedLocation({ id: location.id, patch: { radiusMiles } });
    });
  }

  function makeDefault(location: SavedLocation) {
    return runLocationAction(`default:${location.id}`, 'saved', async () => {
      await setDefaultSavedLocation(location.id);
    });
  }

  function startRename(location: SavedLocation) {
    renamingId = location.id;
    renameDraft = location.name;
    actionError = null;
  }

  function cancelRename() {
    renamingId = null;
    renameDraft = '';
  }

  function saveRename(location: SavedLocation) {
    const name = renameDraft.trim();
    if (!name) {
      actionError = { section: 'saved', message: 'Give this location a name.' };
      return;
    }
    return runLocationAction(`rename:${location.id}`, 'saved', async () => {
      const updated = await updateSavedLocation({ id: location.id, patch: { name } });
      if (locationStore.savedLocationId === updated.id) {
        locationStore.setActive({ ...locationStore.snapshot, name: updated.name });
      }
      cancelRename();
    });
  }

  function removeLocation(location: SavedLocation) {
    if (!confirm(`Delete "${location.name}"?`)) return;
    return runLocationAction(`delete:${location.id}`, 'saved', async () => {
      await deleteSavedLocation(location.id);
      if (locationStore.savedLocationId === location.id) {
        locationStore.setActive({ ...locationStore.snapshot, savedLocationId: null });
      }
    });
  }

  async function logout() {
    await authClient.signOut();
    // Full load so no client-side cache from this account survives sign-out.
    window.location.assign('/login');
  }

  const initial = $derived((user?.name ?? user?.email ?? '?').charAt(0).toUpperCase());
</script>

<div class="settings-page">
  <h1>Settings</h1>

  {#if savedLocationsLoaded && !defaultLocation}
    <div class="default-location-banner" role="status">
      <MapPin size={18} class="banner-icon" />
      <div>
        <strong>Set a default location</strong>
        <p>
          Search for a place or use your current location, then save it. Bite Marks starts
          there on any device you sign in to.
        </p>
      </div>
    </div>
  {/if}

  <section class="settings-card" aria-labelledby="location-heading">
    <h2 id="location-heading" class="eyebrow">Location</h2>

    <div class="location-row">
      <MapPin size={16} class="location-icon" />
      <div class="location-text">
        <div class="location-name">{locationStore.name}</div>
        <div class="location-sub">
          {#if activeSavedLocation?.isDefault}
            Default location
          {:else if activeSavedLocation}
            Saved location
          {:else}
            Not saved
          {/if}
          · used for distances and "spots in view"
        </div>
      </div>
      <button type="button" class="use-current-btn" onclick={useCurrentLocation} disabled={isLocating}>
        <LocateFixed size={13} /> {isLocating ? 'Locating…' : 'Use current'}
      </button>
    </div>
    {#if locateError}<p class="field-error">{locateError}</p>{/if}

    {#if savedLocationsLoaded && !activeSavedLocation}
      <form
        class="save-location-form"
        onsubmit={(event) => {
          event.preventDefault();
          void saveActiveLocation();
        }}
      >
        <label class="text-field">
          <span class="field-label">Name</span>
          <input
            type="text"
            maxlength={MAX_LOCATION_NAME_LENGTH}
            bind:value={() => saveName, (value) => (saveNameDraft = value)}
            disabled={isAtLocationLimit}
          />
        </label>
        <button
          type="submit"
          class="primary-btn"
          disabled={isAtLocationLimit || pendingAction !== null}
        >
          <Bookmark size={14} />
          {pendingAction === 'save' ? 'Saving…' : 'Save this location'}
        </button>
      </form>
      {#if isAtLocationLimit}<p class="field-help">{locationLimitMessage}</p>{/if}
    {/if}

    {#if defaultLocation && locationStore.savedLocationId !== defaultLocation.id}
      <button
        type="button"
        class="text-btn"
        onclick={() => defaultLocation && useSavedLocation(defaultLocation)}
      >
        <RotateCcw size={13} /> Reset to default ({defaultLocation.name})
      </button>
    {/if}
    {#if actionError?.section === 'active'}
      <p class="field-error" role="alert">{actionError.message}</p>
    {/if}

    <label class="search-field">
      <Search size={15} class="search-field-icon" />
      <input
        type="search"
        placeholder="Search for a location"
        bind:value={locationInput}
        oninput={searchHandler}
        autocomplete="off"
      />
    </label>
    {#if locationResults.length}
      <ResultList items={locationResults} onSelect={selectAreaResult} query={locationInput} />
    {/if}
  </section>

  <section class="settings-card" aria-labelledby="radius-heading">
    <h2 id="radius-heading" class="eyebrow">Search radius</h2>

    <div class="radius-value-row">
      <span class="radius-value">{locationStore.radiusMiles}</span>
      <span class="radius-unit">miles</span>
    </div>

    <input
      type="range"
      class="radius-slider"
      min={MIN_RADIUS_MILES}
      max={MAX_RADIUS_MILES}
      step="1"
      bind:value={locationStore.radiusMiles}
      aria-label="Search radius in miles"
    />
    <div class="radius-scale">
      <span>{MIN_RADIUS_MILES} mi</span>
      <span>{MAX_RADIUS_MILES / 2}</span>
      <span>{MAX_RADIUS_MILES} mi</span>
    </div>

    {#if locationWithChangedRadius}
      <div class="radius-changed-row">
        <span>
          Saved radius for {locationWithChangedRadius.name} is
          {locationWithChangedRadius.radiusMiles} mi.
        </span>
        <button
          type="button"
          class="small-btn"
          disabled={pendingAction !== null}
          onclick={() => locationWithChangedRadius && saveChangedRadius(locationWithChangedRadius)}
        >
          Update saved location
        </button>
      </div>
    {/if}
    {#if actionError?.section === 'radius'}
      <p class="field-error" role="alert">{actionError.message}</p>
    {/if}
  </section>

  <section class="settings-card" aria-labelledby="saved-locations-heading">
    <div class="setting-heading-row">
      <h2 id="saved-locations-heading" class="eyebrow">Saved locations</h2>
      {#if savedLocationsLoaded}
        <span class="setting-help">{savedLocations.length} of {MAX_SAVED_LOCATIONS}</span>
      {/if}
    </div>

    {#if savedLocationsError}
      <div class="load-error" role="alert">
        <p class="field-error">Couldn't load your saved locations.</p>
        <button
          type="button"
          class="small-btn"
          disabled={isRetryingSavedLocations}
          onclick={retrySavedLocations}
        >
          {isRetryingSavedLocations ? 'Retrying…' : 'Try again'}
        </button>
      </div>
    {:else if !savedLocationsLoaded}
      <p class="muted-note">Loading…</p>
    {:else if savedLocations.length === 0}
      <p class="muted-note">No saved locations yet. Pick a location above and save it.</p>
    {:else}
      <ul class="saved-list">
        {#each savedLocations as location (location.id)}
          {@const isActive = location.id === locationStore.savedLocationId}
          <li class="saved-item" class:active={isActive}>
            {#if renamingId === location.id}
              <form
                class="rename-form"
                onsubmit={(event) => {
                  event.preventDefault();
                  void saveRename(location);
                }}
              >
                <input
                  type="text"
                  maxlength={MAX_LOCATION_NAME_LENGTH}
                  bind:value={renameDraft}
                  aria-label="Location name"
                />
                <button type="submit" class="small-btn" disabled={pendingAction !== null}>
                  Save
                </button>
                <button type="button" class="small-btn ghost" onclick={cancelRename}>Cancel</button>
              </form>
            {:else}
              <div class="saved-text">
                <div class="saved-name">
                  <span>{location.name}</span>
                  {#if location.isDefault}<span class="default-badge">Default</span>{/if}
                </div>
                <div class="saved-sub">
                  {location.radiusMiles} mi radius{#if isActive} · In use{/if}
                </div>
              </div>
              <div class="saved-actions">
                {#if !isActive}
                  <button type="button" class="small-btn" onclick={() => useSavedLocation(location)}>
                    Use
                  </button>
                {/if}
                {#if !location.isDefault}
                  <button
                    type="button"
                    class="small-btn"
                    disabled={pendingAction !== null}
                    onclick={() => makeDefault(location)}
                  >
                    <Star size={12} /> Make default
                  </button>
                {/if}
                <button
                  type="button"
                  class="icon-btn"
                  aria-label={`Rename ${location.name}`}
                  title="Rename"
                  disabled={pendingAction !== null}
                  onclick={() => startRename(location)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  class="icon-btn danger"
                  aria-label={`Delete ${location.name}`}
                  title="Delete"
                  disabled={pendingAction !== null}
                  onclick={() => removeLocation(location)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
    {#if actionError?.section === 'saved'}
      <p class="field-error" role="alert">{actionError.message}</p>
    {/if}
  </section>

  <section class="settings-card" aria-labelledby="appearance-heading">
    <div class="setting-heading-row">
      <h2 id="appearance-heading" class="eyebrow">Appearance</h2>
      <span class="setting-help">Changes instantly</span>
    </div>

    <div class="theme-options" role="radiogroup" aria-labelledby="appearance-heading">
      <button
        type="button"
        role="radio"
        aria-checked={themePreference === 'light'}
        class:active={themePreference === 'light'}
        onclick={() => chooseTheme('light')}
      >
        <Sun size={15} />
        Light
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={themePreference === 'night'}
        class:active={themePreference === 'night'}
        onclick={() => chooseTheme('night')}
      >
        <Moon size={15} />
        Night
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={themePreference === 'system'}
        class:active={themePreference === 'system'}
        onclick={() => chooseTheme('system')}
      >
        <Monitor size={15} />
        System
      </button>
    </div>
    <p class="appearance-note">
      System follows your device and switches automatically after dark.
    </p>
  </section>

  <section class="settings-card" aria-labelledby="account-heading">
    <h2 id="account-heading" class="eyebrow">Account</h2>

    {#if user}
      <div class="account-row">
        <div class="account-avatar">{initial}</div>
        <div class="account-text">
          <div class="account-name">{user.name ?? user.email ?? 'Signed in'}</div>
          {#if user.name && user.email}
            <div class="account-email">{user.email}</div>
          {/if}
        </div>
      </div>
    {/if}

    <button type="button" class="logout-btn" onclick={logout}>
      <LogOut size={16} />
      Log out
    </button>
  </section>
</div>

<style>
  .settings-page {
    display: grid;
    gap: var(--padding-2);
    max-width: 34rem;
    margin: 0 auto;
    padding: var(--padding-2);
  }

  h1 {
    margin: 0;
    font-family: var(--sys-font-display);
    font-size: 1.5rem;
    font-weight: var(--sys-display-weight);
    letter-spacing: var(--sys-display-tracking);
    color: var(--sys-color-text);
  }

  .settings-card {
    display: grid;
    gap: 0.75rem;
    border: 1px solid var(--comp-card-border);
    border-radius: var(--comp-card-radius);
    background-color: var(--comp-card-bg);
    box-shadow: var(--comp-card-shadow);
    padding: var(--padding-2);
  }

  .eyebrow {
    margin: 0;
    color: var(--comp-section-label-text);
    font-size: var(--comp-section-label-size);
    font-weight: var(--comp-section-label-weight);
    letter-spacing: var(--comp-section-label-spacing);
    text-transform: uppercase;
    font-family: var(--sys-font-mono);
  }

  .setting-heading-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .setting-help {
    color: var(--sys-color-text-muted);
    font-family: var(--sys-font-mono);
    font-size: 0.625rem;
  }

  .theme-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.375rem;
  }

  .theme-options button {
    display: inline-flex;
    min-width: 0;
    min-height: 2.75rem;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    border: 1px solid var(--comp-pill-unselected-border);
    border-radius: var(--sys-radius-control);
    background: transparent;
    color: var(--comp-pill-unselected-text);
    font-family: var(--sys-font-mono);
    font-size: 0.6875rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color 180ms cubic-bezier(0.25, 1, 0.5, 1),
      border-color 180ms cubic-bezier(0.25, 1, 0.5, 1),
      color 180ms cubic-bezier(0.25, 1, 0.5, 1);
  }

  .theme-options button.active {
    border-color: var(--comp-pill-selected-border);
    background: var(--comp-pill-selected-bg);
    color: var(--comp-pill-selected-text);
  }

  .appearance-note {
    max-width: 42ch;
    margin: 0;
    color: var(--sys-color-text-muted);
    font-size: 0.75rem;
    line-height: 1.45;
  }

  .location-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.625rem;
  }

  .location-row :global(.location-icon) {
    color: var(--sys-color-brand);
  }

  .location-text {
    min-width: 0;
  }

  .location-name {
    font-weight: 700;
    font-size: 0.9375rem;
    color: var(--sys-color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .location-sub {
    margin-top: 0.125rem;
    font-size: 0.75rem;
    color: var(--sys-color-text-muted);
  }

  .use-current-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    white-space: nowrap;
    border: 1px solid var(--sys-color-brand);
    border-radius: var(--sys-radius-control);
    background-color: transparent;
    color: var(--sys-color-brand);
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }

  .use-current-btn:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  .load-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .field-error {
    margin: 0;
    color: var(--sys-color-error-text);
    font-size: 0.8125rem;
  }

  .search-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--comp-input-search-bg);
    border-radius: var(--comp-input-search-radius);
    padding: 0.625rem 0.875rem;
    min-height: 2.75rem;
    border: 1px solid transparent;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .search-field:focus-within {
    border-color: var(--sys-color-accent);
    box-shadow: var(--comp-focus-ring);
  }

  .search-field :global(.search-field-icon) {
    color: var(--sys-color-text-muted);
    flex-shrink: 0;
  }

  .search-field input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    outline: none;
    font: inherit;
    color: var(--sys-color-text);
  }

  .search-field input::placeholder {
    color: var(--sys-color-text-muted);
  }

  .radius-value-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .radius-value {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sys-color-text);
    font-variant-numeric: tabular-nums;
  }

  .radius-unit {
    color: var(--sys-color-text-muted);
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .radius-slider {
    width: 100%;
    accent-color: var(--sys-color-brand);
    cursor: pointer;
  }

  .radius-scale {
    display: flex;
    justify-content: space-between;
    color: var(--sys-color-text-muted);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .account-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .account-avatar {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-brand-tint);
    color: var(--sys-color-brand);
    font-weight: 800;
    font-size: 1rem;
  }

  .account-text {
    min-width: 0;
  }

  .account-name {
    font-weight: 700;
    font-size: 0.9375rem;
    color: var(--sys-color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-email {
    margin-top: 0.125rem;
    font-size: 0.75rem;
    color: var(--sys-color-text-muted);
  }

  .logout-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 2.75rem;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-surface);
    color: var(--sys-color-error-text);
    font-weight: 700;
    cursor: pointer;
  }

  .logout-btn:hover {
    background-color: var(--sys-color-error-tint);
    border-color: var(--sys-color-error);
  }

  .default-location-banner {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.75rem;
    align-items: start;
    border: 1px solid var(--sys-color-brand);
    border-radius: var(--comp-card-radius);
    background-color: var(--sys-color-brand-tint);
    padding: var(--padding-2);
    color: var(--sys-color-text);
  }

  .default-location-banner :global(.banner-icon) {
    margin-top: 0.125rem;
    color: var(--sys-color-brand);
  }

  .default-location-banner strong {
    font-size: 0.9375rem;
  }

  .default-location-banner p {
    margin: 0.25rem 0 0;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--sys-color-text-muted);
  }

  .save-location-form {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 0.5rem;
  }

  .text-field {
    display: grid;
    gap: 0.25rem;
    min-width: 0;
  }

  .field-label {
    color: var(--sys-color-text-muted);
    font-family: var(--sys-font-mono);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .text-field input,
  .rename-form input {
    min-width: 0;
    min-height: 2.5rem;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-surface);
    padding: 0 0.75rem;
    font: inherit;
    font-size: 0.875rem;
    color: var(--sys-color-text);
  }

  .text-field input:disabled {
    opacity: 0.6;
  }

  .primary-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 2.5rem;
    white-space: nowrap;
    border: 1px solid var(--sys-color-brand);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-brand);
    color: var(--sys-color-surface);
    padding: 0 0.875rem;
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
  }

  .primary-btn:disabled,
  .small-btn:disabled,
  .icon-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .field-help,
  .muted-note {
    margin: 0;
    color: var(--sys-color-text-muted);
    font-size: 0.8125rem;
    line-height: 1.45;
  }

  .text-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    justify-self: start;
    border: none;
    background: transparent;
    padding: 0;
    color: var(--sys-color-brand);
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
  }

  .radius-changed-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--sys-color-text-muted);
    font-size: 0.8125rem;
  }

  .small-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 2rem;
    white-space: nowrap;
    border: 1px solid var(--comp-pill-unselected-border);
    border-radius: var(--sys-radius-control);
    background: transparent;
    color: var(--sys-color-text);
    padding: 0 0.625rem;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }

  .small-btn.ghost {
    border-color: transparent;
    color: var(--sys-color-text-muted);
  }

  .icon-btn {
    display: inline-grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid transparent;
    border-radius: var(--sys-radius-control);
    background: transparent;
    color: var(--sys-color-text-muted);
    cursor: pointer;
  }

  .icon-btn:hover {
    border-color: var(--sys-color-border);
    color: var(--sys-color-text);
  }

  .icon-btn.danger:hover {
    border-color: var(--sys-color-error);
    background-color: var(--sys-color-error-tint);
    color: var(--sys-color-error-text);
  }

  .saved-list {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .saved-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    padding: 0.625rem 0.75rem;
  }

  .saved-item.active {
    border-color: var(--sys-color-brand);
  }

  .saved-text {
    min-width: 0;
    flex: 1 1 10rem;
  }

  .saved-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 0.875rem;
    color: var(--sys-color-text);
  }

  .saved-name span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .default-badge {
    flex-shrink: 0;
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-brand-tint);
    color: var(--sys-color-brand);
    padding: 0.125rem 0.375rem;
    font-family: var(--sys-font-mono);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .saved-sub {
    margin-top: 0.125rem;
    font-size: 0.75rem;
    color: var(--sys-color-text-muted);
  }

  .saved-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .rename-form {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 0.375rem;
  }

  .rename-form input {
    flex: 1;
  }

  button:focus-visible,
  input:focus-visible {
    outline: none;
    box-shadow: var(--comp-focus-ring);
  }
</style>
