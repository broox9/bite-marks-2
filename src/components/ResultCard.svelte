<script lang="ts">
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import { saveSpot } from '$lib/adapters/primary/remote-handlers/spots.remote';
  import { getPlacePhotoUrl } from '$lib/adapters/secondary/google/google.svelte';
  import { getPriceSymbols } from '$lib/utils/price-level';

  let { place, saveAction, clearAction } : {
    place: ResultPlaceRecord;
    saveAction: (result: unknown, place: ResultPlaceRecord) => void;
    clearAction: () => void;
  } = $props()

  let photoUrl = $state<string | null>(null);
  let photoLoading = $state(true);
  const locationText = $derived(
    [...new Set([place.neighborhood, ...place.areas].filter(Boolean))].join(' · ')
  );

  // Load place photo on mount
  $effect(() => {
    if (place.place_id) {
      photoLoading = true;
      getPlacePhotoUrl(place.place_id, 400, 640)
        .then((url) => {
          photoUrl = url;
        })
        .finally(() => {
          photoLoading = false;
        });
    }
  });

  const wrapSaveAction = async () => {
    const result = await saveSpot({ spot: place })
    saveAction(result, place);
  };

</script>

<div class="result-card">
  <div class="photo-container">
    {#if photoLoading}
      <div class="photo-skeleton"></div>
    {:else if photoUrl}
      <img
        src={photoUrl}
        alt={place.name}
        class="place-photo"
      />
    {:else}
      <div class="photo-empty">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
          <path d="M21 15L16 10L11 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11 15L8 12L3 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    {/if}
  </div>

  <div class="content">
    <p class="eyebrow">Add to your spots</p>
    <h3 class="place-name">{place.name}</h3>
    <p class="place-types">{place.place_types.slice(0,2).join(' · ')}</p>

    <div class="metrics">
      {#if place.rating}
        <div class="metric rating">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1.5L9.854 5.854L14.5 6.5L11.25 9.646L12.062 14.5L8 12.354L3.938 14.5L4.75 9.646L1.5 6.5L6.146 5.854L8 1.5Z" fill="var(--cta-primary)" stroke="var(--cta-primary)" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
          <span class="metric-value">{place.rating}</span>
        </div>
      {/if}
      {#if getPriceSymbols(place.price_level)}
        <div class="metric price">
          <span class="metric-value price-symbols" aria-label={`${getPriceSymbols(place.price_level)} price level`}>
            {getPriceSymbols(place.price_level)}
          </span>
        </div>
      {/if}
    </div>

    <div class="details">
      <p class="address">{place.address}</p>
      {#if locationText}<p class="location">{locationText}</p>{/if}
    </div>

    <div class="button-bar">
      <button type="button" class="save-button" onclick={wrapSaveAction}>Save spot</button>
      <button type="button" class="cancel-button" onclick={clearAction}>Cancel</button>
    </div>
  </div>
</div>

<style>
  .result-card {
    display: flex;
    flex-direction: column;
  }

  .photo-container {
    width: 100%;
    height: clamp(9rem, 24svh, 13rem);
    overflow: hidden;
    background: var(--sys-color-surface-sunken);
  }

  .place-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo-skeleton {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--sys-color-surface-sunken) 0%,
      var(--sys-color-surface-raised) 50%,
      var(--sys-color-surface-sunken) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .photo-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--sys-color-text-muted);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    min-width: 0;
    padding: 1.25rem;
  }

  .eyebrow {
    margin: 0;
    color: var(--sys-color-brand);
    font-family: var(--sys-font-mono);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .place-name {
    margin: 0;
    padding-right: 2rem;
    font-family: var(--sys-font-display);
    font-size: clamp(1.5rem, 5vw, 1.875rem);
    font-weight: var(--sys-display-weight);
    line-height: 1.16;
    color: var(--sys-color-text);
    letter-spacing: var(--sys-display-tracking);
  }

  .place-types {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--sys-color-text-secondary);
    text-transform: capitalize;
  }

  .metrics {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.25rem 0;
  }

  .metric {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 1.75rem;
    padding: 0.25rem 0.625rem;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-pill);
    background: var(--sys-color-surface-raised);
  }

  .metric.rating {
    border-color: var(--sys-color-warning-border);
    background: var(--sys-color-warning-tint);
  }

  .metric.rating .metric-value {
    color: var(--sys-color-warning-text);
  }

  .metric-value {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--sys-color-text);
  }

  .price-symbols {
    color: var(--sys-color-brand);
    letter-spacing: 0.075em;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.25rem;
    padding-top: 0.875rem;
    border-top: 1px solid var(--sys-color-border);
  }

  .address {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.4;
    color: var(--sys-color-text);
  }

  .location {
    margin: 0;
    font-size: 0.75rem;
    color: var(--sys-color-text-muted);
  }

  .button-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
    margin-top: 0.5rem;
  }

  .button-bar button {
    min-height: 2.75rem;
    border-radius: var(--sys-radius-control);
    border: 1px solid var(--sys-color-border);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 700;
  }

  .button-bar .save-button {
    background: var(--comp-btn-primary-bg);
    border-color: var(--comp-btn-primary-border);
    color: var(--comp-btn-primary-text);
  }

  .save-button:hover {
    background: var(--comp-btn-primary-bg-hover);
  }

  .cancel-button {
    background: var(--sys-color-surface-raised);
    color: var(--sys-color-text);
  }

  .cancel-button:hover {
    background: var(--sys-color-surface-sunken);
  }

  .button-bar button:focus-visible {
    outline: none;
    box-shadow: var(--comp-focus-ring);
  }
</style>
