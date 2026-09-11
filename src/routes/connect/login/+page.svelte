<script lang="ts">
  import { page } from '$app/state';
  import { authClient } from '$lib/auth-client';
  let email = $state('');
  let password = $state('');
  let error = $state('');
  let pending = $state(false);
  async function signIn(event: SubmitEvent) {
    event.preventDefault(); pending = true; error = '';
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) throw new Error(result.error.message ?? 'Sign-in failed');
      const redirect = (result.data as unknown as { url?: string; redirect_uri?: string });
      window.location.assign(redirect.redirect_uri ?? redirect.url ?? `/api/auth/oauth2/authorize${page.url.search}`);
    } catch (cause) { error = cause instanceof Error ? cause.message : 'Sign-in failed'; pending = false; }
  }
  async function google() {
    pending = true; error = '';
    try {
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: `/connect/consent${page.url.search}` });
      if (result.error) throw new Error(result.error.message ?? 'Sign-in failed');
    } catch (cause) { error = cause instanceof Error ? cause.message : 'Sign-in failed'; pending = false; }
  }
</script>
<section class="connect">
  <p class="eyebrow">Connect your agent</p><h1>Sign in to Bite Marks</h1>
  <p>Use your existing account. You’ll choose what your agent can access next.</p>
  <form onsubmit={signIn}>
    <label>Email<input type="email" bind:value={email} autocomplete="username" required /></label>
    <label>Password<input type="password" bind:value={password} autocomplete="current-password" required /></label>
    <button disabled={pending}>Continue</button>
  </form>
  <button class="secondary" disabled={pending} onclick={google}>Continue with Google</button>
  <p role="alert">{error}</p>
</section>
<style>
  .connect { max-width: 30rem; margin: 4rem auto; padding: 0 1.25rem; }
  .eyebrow { color: var(--accent-color); text-transform: uppercase; letter-spacing: .1em; font-size: .75rem; }
  h1 { font-size: 2rem; } p { line-height: 1.6; }
  form, label { display: grid; gap: .75rem; } form { gap: 1.5rem; margin: 2rem 0 1rem; }
  input { padding: .8rem; background: var(--bg-color); color: inherit; border: 1px solid var(--accent-color); border-radius: .3rem; font: inherit; }
  button { width: 100%; padding: .85rem; border: 1px solid var(--accent-color); background: var(--accent-color); color: var(--bg-color); border-radius: .3rem; font: inherit; cursor: pointer; }
  .secondary { background: transparent; color: inherit; } button:disabled { opacity: .6; }
</style>
