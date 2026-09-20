<script lang="ts">
  import { MapPin, LocateFixed, LogOut, Monitor, Moon, Search, Sun } from '@lucide/svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { authClient } from '$lib/auth-client';
  import { locationStore } from '$lib/adapters/primary/stores/location.store.svelte';
  import { searchForAreas } from '$lib/adapters/secondary/google/google.svelte';
  import { transformResultToPlace } from '$lib/adapters/secondary/appwrite/dtos/placesToRecord';
  import type { ResultPlaceRecord } from '$lib/core/domain/Place/Place';
  import {
    readThemePreference,
    saveThemePreference,
    type ThemePreference,
  } from '$lib/theme';
  import ResultList from '../../components/ResultList.svelte';

  const user = $derived(page.data.user as { id: string; email?: string | null; name?: string | null } | null);

  let locationInput = $state('');
  let locationResults = $state<ResultPlaceRecord[]>([]);
  let isLocating = $state(false);
  let locateError = $state<string | null>(null);
  let themePreference = $state<ThemePreference>('system');

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
    locationStore.name = neighborhood
      ? neighborhood === name
        ? address
        : `${name}, ${neighborhood}`
      : address;
    locationStore.center = { lat, lng };
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
        locationStore.center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        locationStore.name = 'Current location';
        isLocating = false;
      },
      () => {
        locateError = 'Could not get your location.';
        isLocating = false;
      },
    );
  }

  async function logout() {
    await authClient.signOut();
    goto('/login');
  }

  const initial = $derived((user?.name ?? user?.email ?? '?').charAt(0).toUpperCase());
</script>

<div class="settings-page">
  <h1>Settings</h1>

  <section class="settings-card" aria-labelledby="location-heading">
    <h2 id="location-heading" class="eyebrow">Location</h2>

    <div class="location-row">
      <MapPin size={16} class="location-icon" />
      <div class="location-text">
        <div class="location-name">{locationStore.name}</div>
        <div class="location-sub">Used for distances and "spots in view"</div>
      </div>
      <button type="button" class="use-current-btn" onclick={useCurrentLocation} disabled={isLocating}>
        <LocateFixed size={13} /> {isLocating ? 'Locating…' : 'Use current'}
      </button>
    </div>
    {#if locateError}<p class="field-error">{locateError}</p>{/if}

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
      min="1"
      max="50"
      step="1"
      bind:value={locationStore.radiusMiles}
      aria-label="Search radius in miles"
    />
    <div class="radius-scale">
      <span>1 mi</span>
      <span>25</span>
      <span>50 mi</span>
    </div>
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

  button:focus-visible,
  input:focus-visible {
    outline: none;
    box-shadow: var(--comp-focus-ring);
  }
</style>
