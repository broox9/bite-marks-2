<script lang="ts">
  import { onMount } from 'svelte';
  import { authClient } from '$lib/auth-client';
  import { getPreferences, updatePreferences } from '$lib/adapters/primary/remote-handlers/preferences.remote';
  import { locationStore } from '$lib/adapters/primary/stores/location.store.svelte';
  import type { SearchLocation } from '$lib/core/domain/api';

  let saved = $state<SearchLocation | null>(null);
  let message = $state('');
  let pending = $state(false);
  let connections = $state<{ id: string; clientId: string; clientName: string; scopes: string[] }[]>([]);
  async function loadConnections() {
    const result = await authClient.oauth2.getConsents();
    if (result.error) throw new Error(result.error.message ?? 'Could not load connections');
    connections = await Promise.all((result.data ?? []).map(async connection => {
      const clientResult = await authClient.oauth2.publicClient({ query: { client_id: connection.clientId } });
      const client = clientResult.data as unknown as { name?: string } | null;
      return { ...connection, clientName: client?.name ?? connection.clientId };
    }));
  }
  onMount(() => {
    Promise.all([getPreferences({}).then(value => { saved = value.defaultLocation; }), loadConnections()])
      .catch(error => { message = error instanceof Error ? error.message : 'Could not load settings'; });
  });
  async function saveLocation(clear = false) {
    pending = true; message = '';
    try {
      const defaultLocation = clear ? null : { name: locationStore.name, ...locationStore.center, radiusMeters: locationStore.radiusMeters };
      saved = (await updatePreferences({ defaultLocation })).defaultLocation;
      message = clear ? 'Default location cleared.' : 'Default location saved for your website, mobile app, and agents.';
    } catch (error) { message = error instanceof Error ? error.message : 'Could not save location'; }
    finally { pending = false; }
  }
  async function disconnect(id: string) {
    pending = true; message = '';
    try {
      const result = await authClient.oauth2.deleteConsent({ id });
      if (result.error) throw new Error(result.error.message ?? 'Could not disconnect');
      await loadConnections(); message = 'Agent disconnected. Access has been revoked.';
    } catch (error) { message = error instanceof Error ? error.message : 'Could not disconnect'; }
    finally { pending = false; }
  }
</script>

<section class="settings">
  <p class="eyebrow">Your Bite Marks</p>
  <h1>Settings</h1>
  <section class="setting">
    <h2>Start your search here</h2>
    <p>Your default is used when you or an agent searches without specifying a location.</p>
    <p class="saved">{saved ? `${saved.name} · ${(saved.radiusMeters / 1609.34).toFixed(1)} miles` : 'No saved default'}</p>
    <p>Current search area: <strong>{locationStore.name}</strong>. Change the area on the <a href="/">search page</a>.</p>
    <div class="actions">
      <button disabled={pending} onclick={() => saveLocation()}>Use current search area</button>
      {#if saved}<button class="secondary" disabled={pending} onclick={() => saveLocation(true)}>Clear default</button>{/if}
    </div>
  </section>
  <section class="setting">
    <h2>Connected agents</h2>
    <p>Each connection can access only your data. Disconnect an agent to remove its access.</p>
    {#each connections as connection (connection.id)}
      <div class="connection">
        <div><strong>{connection.clientName}</strong><p>{connection.scopes.includes('bite:write') ? 'Full access — includes editing and deletion' : 'Read-only access'}</p></div>
        <button class="secondary" disabled={pending} onclick={() => disconnect(connection.id)}>Disconnect</button>
      </div>
    {:else}<p>No connected agents.</p>{/each}
  </section>
  <p role="status" aria-live="polite">{message}</p>
</section>

<style>
  .settings { max-width: 44rem; margin: 3rem auto; padding: 0 1.25rem; }
  .eyebrow { color: var(--accent-color); text-transform: uppercase; letter-spacing: .12em; font-size: .75rem; }
  h1 { font-size: clamp(2rem, 6vw, 3rem); margin: .5rem 0 2rem; }
  h2 { font-size: 1.3rem; }
  .setting { padding: 1.5rem 0; border-top: 1px solid var(--accent-color); }
  p { line-height: 1.6; }
  .saved { font-size: 1.2rem; font-weight: 600; }
  .actions, .connection { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
  .connection { justify-content: space-between; padding: 1rem 0; overflow-wrap: anywhere; }
  button { cursor: pointer; padding: .75rem 1rem; border: 1px solid var(--accent-color); background: var(--accent-color); color: var(--bg-color); border-radius: .4rem; font: inherit; }
  button.secondary { background: transparent; color: inherit; }
  button:disabled { opacity: .6; cursor: wait; }
</style>
