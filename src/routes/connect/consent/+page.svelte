<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { authClient } from '$lib/auth-client';
  let access = $state<'read' | 'full'>('read');
  let pending = $state(false);
  let error = $state('');
  let clientName = $state('Your agent');
  const requested = $derived((page.url.searchParams.get('scope') ?? '').split(' '));
  onMount(() => {
    authClient.oauth2.publicClient({ query: { client_id: page.url.searchParams.get('client_id') ?? '' } })
      .then(result => {
        const client = result.data as unknown as { name?: string } | null;
        clientName = client?.name ?? 'Your agent';
      });
  });
  async function consent(accept: boolean) {
    pending = true; error = '';
    try {
      const scope = requested.filter(value => ['openid', 'email', 'profile', 'offline_access', 'bite:read'].includes(value) || (value === 'bite:write' && access === 'full')).join(' ');
      const result = await authClient.oauth2.consent({ accept, scope, oauth_query: page.url.searchParams.toString() });
      if (result.error) throw new Error(result.error.message ?? 'Could not connect');
      if (result.data?.url) window.location.assign(result.data.url);
      else throw new Error('No return address was provided');
    } catch (cause) { error = cause instanceof Error ? cause.message : 'Could not connect'; pending = false; }
  }
</script>
<section class="consent">
  <p class="eyebrow">Your account. Your choice.</p>
  <h1>Connect {clientName}</h1>
  <p>Choose how this agent can use your Bite Marks account. Other people’s lists are never included.</p>
  <fieldset disabled={pending}>
    <legend>Allow access to your data</legend>
    <label class:selected={access === 'read'}><input type="radio" bind:group={access} value="read" /><span><strong>Read only</strong><small>Search places and view your spots, notes, ratings, tags, and saved location.</small></span></label>
    <label class:selected={access === 'full'}><input type="radio" bind:group={access} value="full" disabled={!requested.includes('bite:write')} /><span><strong>Full access</strong><small>Everything above, plus save, edit, and permanently delete your spots and tags, and change your default location.</small></span></label>
  </fieldset>
  {#if !requested.includes('bite:write')}<p>This connection requested read-only access. Your agent can request full access later.</p>{/if}
  <p>You can disconnect this agent in Settings at any time.</p>
  <div class="actions"><button disabled={pending} onclick={() => consent(true)}>Connect agent</button><button class="secondary" disabled={pending} onclick={() => consent(false)}>Cancel</button></div>
  <p role="alert">{error}</p>
</section>
<style>
  .consent { max-width: 38rem; margin: 4rem auto; padding: 0 1.25rem; }
  .eyebrow { color: var(--accent-color); font-size: .75rem; letter-spacing: .1em; text-transform: uppercase; }
  h1 { font-size: clamp(1.8rem, 5vw, 2.7rem); } p { line-height: 1.6; }
  fieldset { border: 0; padding: 0; margin: 2rem 0; display: grid; gap: 1rem; }
  legend { padding-bottom: 1rem; font-weight: 600; }
  label { display: flex; gap: 1rem; padding: 1.25rem; border: 1px solid var(--accent-color); border-radius: .5rem; cursor: pointer; }
  label.selected { background: var(--bg-low-contrast); outline: 2px solid var(--accent-color); }
  small { display: block; line-height: 1.5; margin-top: .5rem; font-size: .9rem; } input { accent-color: var(--accent-color); }
  .actions { display: flex; gap: 1rem; }
  button { padding: .85rem 1.25rem; border: 1px solid var(--accent-color); background: var(--accent-color); color: var(--bg-color); border-radius: .3rem; font: inherit; cursor: pointer; }
  .secondary { background: transparent; color: inherit; } button:disabled { opacity: .6; }
</style>
