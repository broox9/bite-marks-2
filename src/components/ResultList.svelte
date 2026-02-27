<script lang="ts">
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import { Star } from '@lucide/svelte'
  import Card from "./util/Card.svelte";
  const { items, onSelect, anchorName } : { items: ResultPlaceRecord[], onSelect: any, anchorName: string} = $props()
</script>

<!-- <Card> -->
  <ul class="results-list" role="listbox" aria-label="Search results" style="position-anchor: {anchorName};">
      {#each items as item}
      <li role="option" 
        class="result-item"
        data-spot-id={item.place_id} 
        onclick={() => onSelect(item)} 
        aria-selected={false}>
          <div><em>{item.name}</em></div>
          <div class="subtext">
            <small class="">{item.rating ? String(item.rating) : 'n/a'}&nbsp;<Star size={12} strokeWidth={1}/></small>
            <small>{item.neighborhood}</small>
          </div>
          
      </li>
      {/each}
  </ul>
<!-- </Card> -->


<style>
  .results-list {
    position: absolute;
    z-index: 2;
    top: calc(anchor(bottom) + 0.25rem);
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0 0.25rem;
    gap: 0.5rem;
    transition: all 0.3s ease;
    background-color: var(--bg-light);
    border-radius: var(--border-radius);
    border: 1px solid var(--bg-low-contrast);
    padding: var(--padding-1);
    box-shadow: 0.25rem 0.5rem 1rem rgba(0, 0, 0, 0.1);

  }
  .result-item {
    /* border-bottom:1px solid var(--border-muted); */
  }
  .subtext {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.5rem;
    align-items: center;
    color: var(--text-muted)
  }
</style>
