<script lang="ts">
  import type { UserSpotRecord } from "$lib/core/domain/Spot/Spot";
  import { Trash2, MapPin, Star, ChevronRight } from "@lucide/svelte";
  import CuisineIcon from "./CuisineIcon.svelte";
  import { locationStore } from "$lib/adapters/primary/stores/location.store.svelte";
  import { milesBetween, formatMiles } from "$lib/utils/distance";

  type ListItemProps = {
    item: UserSpotRecord;
    deleteSpotAction: (rowId: string) => void;
    mapSpotAction: (rowId: string) => void;
    isMapActive?: boolean;
  };

  const { item, deleteSpotAction, mapSpotAction, isMapActive = false }: ListItemProps = $props();

  let isToolsOpen = $state(false);

  const toggleTools = () => {
    isToolsOpen = !isToolsOpen;
  };

  const distanceLabel = $derived(
    typeof item.lat === "number" && typeof item.lng === "number"
      ? formatMiles(milesBetween(locationStore.center, { lat: item.lat, lng: item.lng }))
      : null,
  );

  const subtitle = $derived(
    [item.neighborhood, ...(item.place_types?.slice(-2) ?? [])].filter(Boolean).join(" · "),
  );
</script>

<div class="list-item-container" id={item.id} data-open={isToolsOpen}>
  <div
    class="list-item-wrapper"
    data-open={isToolsOpen}
    data-map-active={isMapActive}
  >
    <a class="thumb" href={`/spot/${item.id}`} aria-hidden="true" tabindex="-1">
      <CuisineIcon placeTypes={item.place_types} primaryType={item.primaryType} size={22} />
    </a>

    <div class="list-item-content">
      <div class="spot-title-row">
        <a href={`/spot/${item.id}`} class="spot-name" aria-label={`Open ${item.name}`}>{item.name}</a>
      </div>
      {#if subtitle}
        <p class="spot-subtitle">{subtitle}</p>
      {/if}
      <div class="spot-meta-row">
        {#if item.rating}
          <span class="meta-rating"><Star size={11} /> {item.rating.toFixed(1)}</span>
        {/if}
        {#if distanceLabel}
          <span class="meta-distance">{distanceLabel}</span>
        {/if}
        {#if item.is_visited}
          <span class="meta-visited"><span class="visited-dot"></span>Visited</span>
        {/if}
      </div>
    </div>

    <button
      class="tools-toggle"
      type="button"
      onclick={toggleTools}
      aria-expanded={isToolsOpen}
      aria-label={isToolsOpen ? `Close actions for ${item.name}` : `Open actions for ${item.name}`}
    >
      <ChevronRight size={16} />
    </button>
  </div>

  <div class="tool-buttons">
    <button
      type="button"
      class="delete-button"
      aria-label={`Delete ${item.name}`}
      onclick={() => deleteSpotAction(item.id)}><Trash2 size={16} /></button
    >

    <button
      type="button"
      class="map-button"
      data-active={isMapActive}
      aria-pressed={isMapActive}
      aria-label={`Show ${item.name} on map`}
      onclick={() => mapSpotAction(item.id)}><MapPin size={16} /></button
    >
  </div>
</div>

<style>
  .list-item-container {
    position: relative;
    overflow: hidden;
    background-color: var(--comp-list-item-bg);
    border-bottom: 1px solid var(--comp-list-item-divider);
  }

  .list-item-wrapper {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    position: relative;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1.125rem;
    z-index: 2;
    transition: background-color 0.18s ease-out;
    background-color: var(--comp-list-item-bg);
    isolation: isolate;
  }

  .list-item-wrapper[data-open="true"] {
    background-color: var(--sys-color-surface-raised);
  }

  .list-item-wrapper[data-map-active="true"] {
    background-color: var(--sys-color-accent-tint);
  }

  .thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: var(--comp-thumb-radius);
    background-color: var(--comp-thumb-bg);
    border: 1px solid var(--sys-color-border);
    color: var(--sys-color-brand);
    flex-shrink: 0;
  }

  .list-item-content {
    min-width: 0;
  }

  .spot-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .spot-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--comp-list-item-text);
    font-weight: 700;
    font-size: 0.9375rem;
    line-height: 1.25;
  }

  .spot-subtitle {
    margin: 0.125rem 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--comp-list-item-text-sub);
    font-size: 0.75rem;
    line-height: 1.3;
    text-transform: capitalize;
  }

  .spot-meta-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-top: 0.3125rem;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .meta-rating {
    display: inline-flex;
    align-items: center;
    gap: 0.1875rem;
    color: var(--comp-list-item-star);
    font-weight: 700;
  }

  .meta-distance {
    color: var(--comp-list-item-text-sub);
  }

  .meta-visited {
    display: inline-flex;
    align-items: center;
    gap: 0.3125rem;
    color: var(--sys-color-success-text);
    font-weight: 600;
  }

  .visited-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 999px;
    background-color: var(--sys-color-success);
  }

  .tools-toggle {
    flex: 0 0 auto;
    width: 2.25rem;
    min-height: 2.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--sys-radius-control);
    background-color: transparent;
    cursor: pointer;
    color: var(--comp-list-item-chevron);
    transition:
      transform 0.22s cubic-bezier(0.25, 1, 0.5, 1),
      border-color 0.18s ease-out,
      background-color 0.18s ease-out,
      color 0.18s ease-out;
  }

  .list-item-wrapper[data-open="true"] .tools-toggle {
    transform: translateX(-6rem) rotate(90deg);
    border-color: var(--sys-color-accent);
    background-color: var(--sys-color-surface);
    color: var(--sys-color-text);
  }

  .tool-buttons {
    position: absolute;
    display: flex;
    flex-direction: row;
    border: none;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s ease-out;
  }

  .list-item-container[data-open="true"] .tool-buttons {
    z-index: 3;
    opacity: 1;
    pointer-events: auto;
  }

  .tool-buttons button {
    height: 100%;
    width: 3rem;
    border: none;
    color: var(--sys-color-text-on-dark);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .delete-button {
    background-color: var(--comp-btn-danger-bg);
  }

  .map-button {
    background-color: var(--sys-color-success);
  }

  .map-button[data-active="true"] {
    background-color: var(--sys-color-accent);
  }

  :is(button, a):focus-visible {
    outline: none;
    box-shadow: var(--comp-focus-ring);
  }

  @media (hover: hover) {
    .list-item-wrapper:hover {
      background-color: var(--comp-list-item-bg-hover);
    }

    .tools-toggle:hover {
      border-color: var(--sys-color-border);
      color: var(--sys-color-text);
      background-color: var(--sys-color-surface);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tools-toggle,
    .tool-buttons {
      transition: none;
    }
  }
</style>
