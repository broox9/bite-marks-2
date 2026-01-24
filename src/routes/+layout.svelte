<script lang="ts">
	import '../styles/app.css';
  import type { LayoutProps, LayoutData, PageData} from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  // do these CLEAN, don't use them directily
  import { storeDeleteUser } from '$lib/adapters/primary/stores/user.store.svelte';
  import { locationStore } from '$lib/adapters/primary/stores/location.store.svelte';

  import ContainedZone from '../components/util/ContainedZone.svelte';

	let { data, children }: LayoutProps = $props();
  // const HOME_ROUTE = '/'
  // const LOGIN_ROUTE = '/login'
  // const isLoginPage = $derived(page.route === LOGIN_ROUTE) // makes changes reactive
  let currentPlace = $derived(locationStore)

  console.log('[bs] LAYOUT::layout effect', page.route, data )

  const logout = async () => {
    await storeDeleteUser()
    goto('/login')
  }
</script>


<div id="body-container">
	<header id="page-header">
    <ContainedZone cssClasses="flex justify-between center-align">
      <div>
        <!-- <img src="/new-bite-marks-logo.png" alt="Bite Marks" width="32" height="48" /> -->
        <a href="/">Bite Marks</a>
      </div>

      <nav>
        <ul class='flex flex-row gap-2'>
          <li><a href="/list">Spots</a></li>
          <li><a href="/">Search</a></li>
          <li><a href="/tags">Tags</a></li>
        </ul>
      </nav>
      <!-- <button onclick={logout}>Logout</button> -->
    </ContainedZone>
    <ContainedZone cssClasses="sub-header flex justify-center center-align">
      <em>
        { currentPlace.name || "???" } ({currentPlace.radiusMiles} miles)
      </em>
    </ContainedZone>
  </header>

  <section id="page-content">
    {@render children()}
  </section>

  <section id="bottom-sheet">
    Bottom Sheet here
  </section>

  <footer>
    <a href="/login">Login</a>
    <a href="/">Home</a>
    <button onclick={logout} type="button">Logout</button>
    <button type='button' disabled={true}>disabled</button>
  </footer>
</div>

<style>
  #body-container {
      width: 100%;
      /*min-height: 100svh;*/
      box-sizing: border-box;
      display: grid;
      grid-template:
      "header"
      "content";
      grid-template-rows: auto 1fr;
      height: 100vh;
      overflow: hidden;
  }


  #page-header {
    grid-area: header;
  }

  #page-header .sub-header {
    background-color: var(--bg-low-contrast);
  }

  #page-content {
    grid-area: content;
    overflow: hidden; /* Prevent page-level scrolling, allow children to scroll */
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
