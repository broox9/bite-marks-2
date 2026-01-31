<script lang="ts">
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import { saveSpot } from '$lib/adapters/primary/remote-handlers/spots.remote';
  import { getPlacePhotoUrl } from '$lib/adapters/secondary/google/google.svelte';
  import Card from "./util/Card.svelte";

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
</script>

<div class="flex gap-4">
  <!-- Photo -->
  <div class="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
    {#if photoLoading}
      <div class="w-full h-full animate-pulse bg-gray-200"></div>
    {:else if photoUrl}
      <img 
        src={photoUrl} 
        alt={place.name} 
        class="w-full h-full object-cover"
      />
    {:else}
      <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
        No photo
      </div>
    {/if}
  </div>

  <!-- Content -->
  <div class="flex-1">
    <h3 class="font-bold text-2xl">{place.name}</h3>
    <small>{place.place_types.slice(0,2).join(' - ')}</small>
    <br />
    <span>{place.address}</span>
    <br />
    <small>{place.neighborhood}, {place.areas.join(', ')}</small>
    <br />
    <em>{place.rating}</em> | {place.price_level}

    <br />
    <br />
    <button type="submit" onclick={wrapSaveAction}>Save</button>
    <button type="button" onclick={clearAction}>Clear</button>
  </div>
</div>

<!-- <pre>
{JSON.stringify(place, null, 2)}
</pre> -->
