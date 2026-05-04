<script lang="ts">
  import type { UserSpotRecord } from "$lib/core/domain/Spot/Spot";
  import { Trash2, MapPin, Settings2 } from "@lucide/svelte";

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
</script>

<div class="list-item-container" id={item.id} data-open={isToolsOpen}>
  <div
    class="list-item-wrapper"
    data-open={isToolsOpen}
    data-map-active={isMapActive}
  >
    <div class="list-item-content">
      <div class="spot-title-row">
        <a href={`/spot/${item.id}`} aria-label={`Open ${item.name}`}>{item.name}</a>
        {#if item.is_visited}
          <span class="visited-check">v</span>
        {/if}
      </div>
      <p>{item.address}</p>
    </div>

    <button
      class="tools-toggle"
      type="button"
      onclick={toggleTools}
      aria-expanded={isToolsOpen}
      aria-label={isToolsOpen ? `Close actions for ${item.name}` : `Open actions for ${item.name}`}
    >
      <Settings2 size={16} />
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
    border: none;
    border-radius: 0;
    overflow: hidden;
    background-color: var(--bg-light);
    border-bottom: 1px solid var(--bg-low-contrast);
  }

  .list-item-wrapper {
    display: flex;
    position: relative;
    flex-direction: row;
    align-items: center;
    gap: var(--padding-2);
    justify-content: space-between;
    width: 100%;
    padding: var(--padding-2);
    z-index: 2;
    transition:
      background-color 0.18s ease-out;
    background-color: var(--bg-color);
    isolation: isolate;
  }

  .list-item-wrapper[data-open="true"] {
    background-color: var(--bg-light);
  }

  .list-item-wrapper[data-map-active="true"] {
    background-color: var(--accent-color-tint);
  }

  .list-item-wrapper button {
    flex: 0 0 auto;
    width: 2.75rem;
    min-height: 2.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--border-radius);
    background-color: transparent;
    cursor: pointer;
    color: var(--bg-medium-contrast);
    transition:
      transform 0.22s cubic-bezier(0.25, 1, 0.5, 1),
      border-color 0.18s ease-out,
      background-color 0.18s ease-out,
      color 0.18s ease-out;
  }

  .list-item-wrapper[data-open="true"] .tools-toggle {
    transform: translateX(-6rem);
    border-color: var(--accent-color);
    background-color: var(--bg-light);
    color: var(--bg-high-contrast);
  }

  .list-item-content {
    flex: 1;
    min-width: 0;
  }

  .spot-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .spot-title-row a {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--bg-high-contrast);
    font-weight: 700;
    line-height: 1.25;
  }

  .list-item-content p {
    margin: 0.25rem 0 0;
    color: var(--bg-medium-contrast);
    font-size: 0.875rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .visited-check {
    flex: 0 0 auto;
    border: 1px solid var(--accent-color);
    border-radius: 1rem;
    /* background-color: var(--bg-low-contrast); */
    color: var(--text-muted);
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1;
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
    color: var(--bg-light);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .delete-button {
    background-color: var(--error);
  }

  .map-button {
    background-color: var(--success);
  }

  .map-button[data-active="true"] {
    background-color: var(--accent-color);
  }

  :is(button, a):focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px oklch(from var(--accent-color) l c h / 0.26);
  }

  @media (hover: hover) {
    .list-item-wrapper:hover {
      background-color: var(--bg-light);
    }

    .list-item-wrapper button:hover {
      border-color: var(--bg-low-contrast);
      color: var(--bg-high-contrast);
      background-color: var(--bg-light);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .list-item-wrapper button,
    .tool-buttons {
      transition: none;
    }
  }
</style>
