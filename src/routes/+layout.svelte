<script lang="ts">
  import { Hamburger } from "@lucide/svelte";
  import "../styles/app.css";
  import type { LayoutProps, LayoutData, PageData } from "./$types";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  import { locationStore } from "$lib/adapters/primary/stores/location.store.svelte";

  import ContainedZone from "../components/util/ContainedZone.svelte";
  import MainNavLinks from "../components/MainNavLinks.svelte";

  let { data, children }: LayoutProps = $props();
  // const HOME_ROUTE = '/'
  // const LOGIN_ROUTE = '/login'
  // const isLoginPage = $derived(page.route === LOGIN_ROUTE) // makes changes reactive
  let currentPlace = $derived(locationStore);

  const logout = () => {
    goto("/logout");
  };
</script>

<svelte:head>
  <title>Bite Marks</title>
  <link
    href="https://api.mapbox.com/mapbox-gl-js/v3.19.0/mapbox-gl.css"
    rel="stylesheet"
  />
</svelte:head>

<div id="body-container">
  <header id="page-header">
    <ContainedZone>
      <div class="main-header">
        <strong>
          <!-- <img src="/new-bite-marks-logo.png" alt="Bite Marks" width="32" height="48" /> -->
          <a href="/">
            <Hamburger size={24} />
            Bite Marks
          </a>
        </strong>

        <MainNavLinks ariaLabel="Main navigation" />
      </div>
      <!-- <button onclick={logout}>Logout</button> -->

      <div class="sub-header">
        <small>
          <a href="/">{currentPlace.name || "???"} ({currentPlace.radiusMiles} miles)</a>
        </small>
      </div>
    </ContainedZone>
  </header>

  <section id="page-content">
    {@render children()}
  </section>

  <section id="bottom-sheet">Bottom Sheet here</section>

  <footer>
    <a class="footer-link" href="/">Home</a>
    {#if data.user}
      <button class="footer-link footer-link--button" onclick={logout} type="button"
        >Logout</button
      >
    {/if}
  </footer>
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
      "content"
      "footer";
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    /*overflow: hidden;*/
    background-color: var(--bg-color);
  }

  #page-header {
    grid-area: header;
    /* background: var(--bg-light); */
    padding: 0.25rem;
  }

  #page-header .sub-header {
    background-color: oklch(from var(--bg-low-contrast) l c h / 0.5);
    color: var(--text-muted);
    padding: 0.25rem;
    text-align: center;
    border-radius: var(--border-radius);
    font-style: italic;
    font-weight:300;
    letter-spacing: 0.05ch;
  }

  .main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.25rem;
  }

  .main-header strong {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
  }

  footer {
    grid-area: footer;
    width: 100%;
    margin-top: 3.5rem;
    background-color: var(--bg-light);
    padding: 0.25rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .footer-link {
    color: var(--accent-color);
    text-decoration: none;
  }

  .footer-link--button {
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    cursor: pointer;
  }

  #page-content {
    grid-area: content;
    /*overflow: hidden; /* Prevent page-level scrolling, allow children to scroll */
    min-height: 0; /* Allow grid item to shrink below content size */
  }

  #bottom-sheet {
    /* grid-area: content; */
    display: none;
    bottom: -100px;
    width: 100%;
    z-index: -4;
    height: minmax(200px, 50svh);
    place-self: end;

    .open {
      display: fixed;
      bottom: 0;
      z-index: 10;
    }
  }

  @media (min-width: 768px) {
    #bottom-sheet {
      display: none;
    }
  }
</style>
