<script lang="ts">
  import { ArrowLeft, MapPin } from "@lucide/svelte";
  import { page } from "$app/state";
</script>

<svelte:head>
  <title>Spot not found · Bite Marks</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="not-found">
  <div class="pin-mark" aria-hidden="true"><MapPin size={30} /></div>
  <p class="eyebrow">{page.status} · Off the map</p>
  <h1>This spot slipped away.</h1>
  <p>{page.error?.message ?? "We couldn't find that spot in the Bite Marks catalog."}</p>
  <a href="/all-spots"><ArrowLeft size={17} />Browse all spots</a>
</main>

<style>
  .not-found {
    display: grid;
    justify-items: center;
    max-width: 36rem;
    margin: 0 auto;
    padding: clamp(4rem, 14svh, 8rem) 1.5rem;
    text-align: center;
    color: var(--sys-color-text);
  }

  .pin-mark {
    display: grid;
    place-items: center;
    width: 4.25rem;
    height: 4.25rem;
    margin-bottom: 1.25rem;
    border: 1px solid var(--sys-color-border);
    border-radius: 50%;
    background: var(--sys-color-surface-sunken);
    color: var(--sys-color-brand);
  }

  .eyebrow {
    margin: 0;
    color: var(--comp-eyebrow-text);
    font-family: var(--sys-font-mono);
    font-size: var(--comp-eyebrow-size);
    font-weight: var(--comp-eyebrow-weight);
    letter-spacing: var(--comp-eyebrow-spacing);
    text-transform: uppercase;
  }

  h1 {
    margin: 0.5rem 0 0;
    font-family: var(--sys-font-display);
    font-size: clamp(2rem, 8vw, 3.25rem);
    line-height: 1;
  }

  .not-found > p:last-of-type {
    max-width: 32rem;
    margin: 1rem 0 1.75rem;
    color: var(--sys-color-text-muted);
    line-height: 1.6;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 2.75rem;
    border-radius: var(--sys-radius-control);
    padding: 0.55rem 1rem;
    background: var(--comp-btn-primary-bg);
    color: var(--comp-btn-primary-text);
    font-weight: 700;
  }

  a:hover {
    background: var(--comp-btn-primary-bg-hover);
    color: var(--comp-btn-primary-text);
  }

  a:focus-visible {
    outline: none;
    box-shadow: var(--comp-focus-ring);
  }
</style>
