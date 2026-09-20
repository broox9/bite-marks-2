<script lang="ts">
  import "../styles/app.css";
  import DotLogo from '$lib/assets/bite-marks-dot.svg'
  import { Menu } from '@lucide/svelte';
  import { onMount } from 'svelte';

  import type { LayoutProps } from "./$types";
  import { PUBLIC_CONVEX_URL } from "$env/static/public";
  import { createSvelteAuthClient } from "@mmailaender/convex-better-auth-svelte/svelte";
  import { authClient } from "$lib/auth-client";
  import {
    applyThemePreference,
    readThemePreference,
    THEME_CHANGE_EVENT,
    type ThemePreference,
  } from '$lib/theme';

  import ContainedZone from "../components/util/ContainedZone.svelte";
  import MainNavLinks from "../components/MainNavLinks.svelte";
  import BottomNav from '../components/BottomNav.svelte';

  let { data, children }: LayoutProps = $props();

  createSvelteAuthClient({
    authClient,
    convexUrl: PUBLIC_CONVEX_URL,
    getServerState: () => data.authState,
  });

  onMount(() => {
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () => applyThemePreference(readThemePreference(localStorage));
    const handleThemeChange = (event: Event) => {
      applyThemePreference((event as CustomEvent<ThemePreference>).detail);
    };

    syncTheme();
    colorScheme.addEventListener('change', syncTheme);
    window.addEventListener('storage', syncTheme);
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

    return () => {
      colorScheme.removeEventListener('change', syncTheme);
      window.removeEventListener('storage', syncTheme);
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  });
</script>

<svelte:head>
  <title>Bite Marks</title>
  <link rel="icon" href={DotLogo} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Mono:wght@400;500;600&family=Inter+Tight:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
    rel="stylesheet"
  />
  <link
    href="https://api.mapbox.com/mapbox-gl-js/v3.19.0/mapbox-gl.css"
    rel="stylesheet"
  />
</svelte:head>

<div id="body-container" class:has-bottom-nav={!!data.user}>
  <header id="page-header">
    <ContainedZone>
      <div class="main-header">
        <strong>

          <a href="/">
            <img src={DotLogo} alt="" height="24" />
            <span>Bite Marks</span>
          </a>
        </strong>

        <MainNavLinks ariaLabel="Main navigation" class="desktop-nav" />
        <a class="mobile-menu" href="/settings" aria-label="Open settings">
          <Menu size={18} />
        </a>
      </div>
    </ContainedZone>
  </header>

  <section id="page-content">
    {@render children()}
  </section>

  {#if data.user}
    <BottomNav />
  {/if}
</div>

<style>
  #body-container {
    position: relative;
    /* width: 100%; */
    box-sizing: border-box;
    /* padding-inline: 0.5rem; */
    display: grid;
    grid-template:
      "header"
      "content";
    grid-template-rows: auto 1fr;
    min-height: 100svh;
    padding-bottom: 0;
    background-color: var(--sys-color-page);
  }

  #body-container.has-bottom-nav {
    padding-bottom: calc(var(--comp-nav-height) + env(safe-area-inset-bottom));
  }

  #page-header {
    grid-area: header;
    border-bottom: 1px solid var(--sys-color-border);
    background: var(--sys-color-page);
    padding: 0.45rem 0;
  }

  .main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 2.75rem;
    padding: 0 1.125rem;
  }

  .main-header strong a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--sys-font-display);
    font-size: var(--sys-brand-size);
    font-weight: var(--sys-brand-weight);
    letter-spacing: var(--sys-display-tracking);
    color: var(--comp-header-brand-text);
  }

  .mobile-menu {
    width: 2.125rem;
    height: 2.125rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--comp-header-menu-border);
    border-radius: var(--sys-radius-control);
    background: var(--sys-color-surface-sunken);
    color: var(--comp-header-menu-text);
  }

  #page-content {
    grid-area: content;
    /*overflow: hidden; /* Prevent page-level scrolling, allow children to scroll */
    min-height: 0; /* Allow grid item to shrink below content size */
  }

  :global(.desktop-nav) {
    display: none;
  }

  @media (min-width: 768px) {
    #body-container {
      padding-bottom: 0;
    }

    .mobile-menu {
      display: none;
    }

    :global(.desktop-nav) {
      display: block;
    }
  }
</style>
