<script lang="ts">
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import { Trash2, MapPin, Settings2 } from "@lucide/svelte";

  type ListItemProps = {
    item: ResultPlaceRecord;
    deleteSpotAction: (rowId: string) => void;
    mapSpotAction: (rowId: string) => void;
  };

  const { item, deleteSpotAction, mapSpotAction }: ListItemProps = $props();
  let contentElement = null;

  let isToolsOpen = $state(false);

  const toggleTools = () => {
    isToolsOpen = !isToolsOpen;
  };
</script>

<div class="list-item-container">
  <div
    class="list-item-wrapper"
    bind:this={contentElement}
    data-open={isToolsOpen}
  >
    <div class="list-item-content">
      <strong>
        <a name={item.id} aria-ignored="true"></a>
        <a href="spot/{item.id}">{item.name}</a>
        {#if item.is_visited}
          <small class="visited-check">✓</small>
        {/if}
      </strong>
      <br />
      <small>{item.address}</small>
      <!-- <br />
      <small>{item.neighborhood} - {item.lat}, {item.lng}</small>
      <br /> -->
      <!-- <pre>{JSON.stringify(spot, null, 2)}</pre> -->
    </div>

    <button type="button" onclick={toggleTools}>
      <Settings2 size={16} />
    </button>
  </div>

  <div class="tool-buttons">
    <button
      type="button"
      class="delete-button"
      onclick={() => deleteSpotAction(item.id)}><Trash2 size={16} /></button
    >

    <button
      type="button"
      class="map-button"
      onclick={() => mapSpotAction(item.id)}><MapPin size={16} /></button
    >
  </div>
</div>

<style>
  .list-item-container {
    position: relative;
    /* display: grid; */
    border: none;
    border-radius: 0;

    /* > * {
      grid-area: 1 / 1;
    } */
  }

  .list-item-wrapper {
    display: flex;
    position: relative;
    flex-direction: row;
    gap: 1rem;
    justify-content: space-between;
    flex-basis: 100%;
    left: 0;
    padding: 1rem;
    z-index: 2;
    transition: all 0.25s ease;
    background-color: var(--bg-light);
    isolation: isolate;
  }

  .list-item-wrapper[data-open="true"] {
    left: -6rem;
    /* box-shadow: 7px 12px 0.25rem #00000044; */
  }

  .list-item-wrapper button {
    border: none;
    background-color: transparent;
    cursor: pointer;
    color: var(--bg-low-contrast);
  }

  .list-item-content {
    flex-grow: 1;
  }

  .visited-check {
    color: var(--bg-low-contrast);
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
  }

  .tool-buttons button {
    height: 100%;
    width: 3rem;
    border: none;
    color: var(--bg-light);
  }

  .delete-button {
    background-color: var(--error);
  }

  .map-button {
    background-color: var(--success);
  }
</style>
