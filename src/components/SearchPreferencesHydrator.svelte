<script lang="ts">
  import { getSearchPreferences } from '$lib/adapters/primary/remote-handlers/search-preferences.remote';
  import { locationStore } from '$lib/adapters/primary/stores/location.store.svelte';

  const preferenceQuery = getSearchPreferences({});
  let hydratedPreference = $state<unknown>(null);

  $effect(() => {
    const preference = preferenceQuery.current;
    if (!preference || preference === hydratedPreference) return;
    hydratedPreference = preference;
    locationStore.apply(preference);
  });
</script>
