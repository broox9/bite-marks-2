<script lang="ts">
  import { Hamburger } from "@lucide/svelte";
  import "../styles/app.css";
  import type { LayoutProps, LayoutData, PageData } from "./$types";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  // do these CLEAN, don't use them directily
  import { storeDeleteUser } from "$lib/adapters/primary/stores/user.store.svelte";
  import { locationStore } from "$lib/adapters/primary/stores/location.store.svelte";

  import ContainedZone from "../components/util/ContainedZone.svelte";

  let { data, children }: LayoutProps = $props();
  // const HOME_ROUTE = '/'
  // const LOGIN_ROUTE = '/login'
  // const isLoginPage = $derived(page.route === LOGIN_ROUTE) // makes changes reactive
  let currentPlace = $derived(locationStore);

  const logout = async () => {
    await storeDeleteUser();
    goto("/login");
  };
</script>

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

        <nav>
          <ul>
            <li><a href="/list">Spots</a></li>
            <li><a href="/">Search</a></li>
            <li><a href="/tags">Tags</a></li>
          </ul>
        </nav>
      </div>
      <!-- <button onclick={logout}>Logout</button> -->

      <div class="sub-header">
        <small
          >{currentPlace.name || "???"} ({currentPlace.radiusMiles} miles)</small
        >
      </div>
    </ContainedZone>
  </header>

  <section id="page-content">
    {@render children()}
  </section>

  <section id="bottom-sheet">Bottom Sheet here</section>

  <footer>
    <a href="/login">Login</a>
    <a href="/">Home</a>
    <button onclick={logout} type="button">Logout</button>
    <!-- <button type='button' disabled={true}>disabled</button> -->
  </footer>
</div>

<style>
  #body-container {
    position: relative;
    /*font-size: 16px;*/
    width: 100%;
    box-sizing: border-box;
    /* padding-inline: 0.5rem; */
    /*display: grid;*/
    /* grid-template:
    "header"
    "content";
    grid-template-rows: auto 1fr; */
    min-height: 100vh;
    /*overflow: hidden;*/
    background-color: var(--bg-light);
  }

  .main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem;
  }

  .main-header strong {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
  }

  nav ul {
    display: flex;
    list-style: none;
    gap: 1rem;
  }

  nav ul li a {
    color: var(--accent-color)
  }


  footer {
    width: 100%;
    margin-top: 3.5rem;
    background-color: var(--bg-light);
    padding: 0.25rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
  }

  #page-header {
    /* grid-area: header; */
    background: var(--bg-light);
    padding: 0.25rem;
  }

  #page-header .sub-header {
    background-color: var(--bg-low-contrast);
    padding: 0.25rem;
    text-align: center;
  }

  #page-content {
    /* grid-area: content; */
    /*overflow: hidden; /* Prevent page-level scrolling, allow children to scroll */*/
    min-height: 0; /* Allow grid item to shrink below content size */
  }

  #bottom-sheet {
    /* grid-area: content; */
    display: none;
    bottom: -100px;
    width: 100%;
    background-color: hsla(0, 0%, 0%, 0.5);
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
