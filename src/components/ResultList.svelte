<script lang="ts">
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import { Star } from '@lucide/svelte'
  import Card from "./util/Card.svelte";
  const { items, onSelect } : { items: ResultPlaceRecord[], onSelect: any} = $props()
</script>

<!-- <Card> -->
  <ul id="results-list" role="listbox" class="flex flex-col gap-2">
      {#each items as item}
      <li role="option" 
        class="py-2 my-2 result-item"
        data-spot-id={item.place_id} 
        onclick={() => onSelect(item)} 
        aria-selected={false}>
          <div>{item.name}</div>
          <div class="flex flex-row justify-between items-center subtext">
            <small>{item.neighborhood}</small>
            <small class="flex flex-row items-center justify-end">{item.rating ? String(item.rating) : 'n/a'}&nbsp;<Star size={12} strokeWidth={1}/></small>
          </div>
          
      </li>
      {/each}
  </ul>
<!-- </Card> -->


<style>
  .result-item {
    /* border-bottom:1px solid var(--border-muted); */
  }
  .subtext {
    color: var(--text-muted)
  }
</style>
