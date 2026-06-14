<script lang="ts">
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import { saveSpot } from '$lib/adapters/primary/remote-handlers/spots.remote';
  import { getPlacePhotoUrl } from '$lib/adapters/secondary/google/google.svelte';
  import Card from "./util/Card.svelte";
  import Button from "./ui/Button.svelte";

  let { place, saveAction, clearAction } : { place: ResultPlaceRecord, saveAction: (place: ResultPlaceRecord, result: any) => undefined, clearAction: () => undefined } = $props()

  let photoUrl = $state<string | null>(null);
  let photoLoading = $state(true);

  // Load place photo on mount
  $effect(() => {
    if (place.place_id) {
      photoLoading = true;
      getPlacePhotoUrl(place.place_id, 200, 300)
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

  function getPriceSymbols(priceLevel: string): string {
    const map: Record<string, string> = {
      'free': 'Free',
      'inexpensive': '$',
      'moderate': '$$',
      'expensive': '$$$',
      'very_expensive': '$$$$'
    };
    return map[priceLevel] || priceLevel;
  }
</script>

<div class="result-card">
  <!-- Photo -->
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

  <!-- Content -->
  <div class="content">
    <h3 class="place-name">{place.name}</h3>
    <p class="place-types">{place.place_types.slice(0,2).join(' · ')}</p>
    
    <!-- Rating and Price Display -->
    <div class="metrics">
      {#if place.rating}
        <div class="metric rating">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1.5L9.854 5.854L14.5 6.5L11.25 9.646L12.062 14.5L8 12.354L3.938 14.5L4.75 9.646L1.5 6.5L6.146 5.854L8 1.5Z" fill="var(--cta-primary)" stroke="var(--cta-primary)" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
          <span class="metric-value">{place.rating}</span>
        </div>
      {/if}
      {#if place.price_level && place.price_level !== 'free'}
        <div class="metric price">
          <span class="metric-label">Price</span>
          <span class="metric-value price-symbols">{getPriceSymbols(place.price_level)}</span>
        </div>
      {/if}
    </div>

    <div class="details">
      <p class="address">{place.address}</p>
      <p class="location">{place.neighborhood}{place.areas.length > 0 ? ` · ${place.areas.join(' · ')}` : ''}</p>
    </div>

    <div class="button-bar">
      <Button type="submit" onclick={wrapSaveAction}>Save</Button>
      <Button type="button" onclick={clearAction}>Cancel</Button>
    </div>
  </div>
</div>

<!-- <pre>
{JSON.stringify(place, null, 2)}
</pre> -->
<style>
  .result-card {
    display: flex;
    gap: 20px;
    padding: 24px;
  }

  .photo-container {
    flex-shrink: 0;
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-low-contrast);
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
      var(--bg-low-contrast) 0%,
      var(--bg-light) 50%,
      var(--bg-low-contrast) 100%
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
    color: var(--bg-medium-contrast);
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .place-name {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--bg-high-contrast);
    letter-spacing: -0.01em;
  }

  .place-types {
    margin: 0;
    font-size: 0.875rem;
    color: var(--bg-medium-contrast);
    text-transform: capitalize;
  }

  .metrics {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-top: 1px solid var(--bg-low-contrast);
    border-bottom: 1px solid var(--bg-low-contrast);
  }

  .metric {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .metric.rating {
    gap: 6px;
  }

  .metric.price {
    gap: 8px;
  }

  .metric-label {
    font-size: 0.8125rem;
    color: var(--bg-medium-contrast);
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .metric-value {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--bg-high-contrast);
  }

  .price-symbols {
    color: var(--cta-primary);
    font-weight: 700;
    letter-spacing: 0.1em;
    font-size: 1.0625rem;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .address {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--bg-high-contrast);
  }

  .location {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--bg-medium-contrast);
  }

  .button-bar {
    display: flex;
    gap: 12px;
    margin-top: auto;
    padding-top: 12px;
  }
</style>
