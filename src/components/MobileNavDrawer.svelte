<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import {
    List,
    LogIn,
    LogOut,
    Map,
    Menu,
    Navigation,
    Plus,
    Search,
    Settings,
    Tags,
    X,
  } from '@lucide/svelte';
  import { tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { authClient } from '$lib/auth-client';

  interface UserSummary {
    name?: string | null;
    email?: string | null;
  }

  interface Props {
    user?: UserSummary | null;
  }

  const browseItems = [
    { label: 'Spots map', href: '/list', icon: Map },
    { label: 'All spots', href: '/all-spots', icon: List },
    { label: 'Search', href: '/', icon: Search },
    { label: 'Tags', href: '/tags', icon: Tags },
  ];

  let { user = null }: Props = $props();
  let open = $state(false);
  let triggerButton = $state<HTMLButtonElement>();
  let closeButton = $state<HTMLButtonElement>();
  let drawer = $state<HTMLElement>();

  const displayName = $derived(
    user?.name ?? user?.email?.split('@')[0] ?? 'Bite Marks',
  );
  const initial = $derived(displayName.charAt(0).toUpperCase());

  function isActive(href: string) {
    if (href === '/') return page.url.pathname === '/';
    return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
  }

  async function openMenu() {
    open = true;
    await tick();
    closeButton?.focus();
  }

  async function closeMenu(restoreFocus = false) {
    open = false;
    if (restoreFocus) {
      await tick();
      triggerButton?.focus();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      void closeMenu(true);
      return;
    }

    if (event.key !== 'Tab' || !drawer) return;

    const focusable = Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  async function logout() {
    await authClient.signOut();
    open = false;
    await goto('/login');
  }

  $effect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });
</script>

<button
  bind:this={triggerButton}
  class="menu-trigger"
  type="button"
  aria-label="Open navigation menu"
  aria-haspopup="dialog"
  aria-expanded={open}
  aria-controls="mobile-navigation"
  onclick={openMenu}
>
  <Menu size={19} strokeWidth={2.25} />
</button>

{#if open}
  <button
    class="menu-scrim"
    type="button"
    aria-label="Close navigation menu"
    onclick={() => closeMenu()}
    transition:fade={{ duration: 180 }}
  ></button>

  <div
    bind:this={drawer}
    id="mobile-navigation"
    class="menu-drawer"
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-label="Navigation menu"
    onkeydown={handleKeydown}
    transition:fly={{ x: 48, duration: 220 }}
  >
    <header class="account-header">
      <div class="account-avatar" aria-hidden="true">{initial}</div>
      <div class="account-copy">
        <strong>{displayName}</strong>
        <span>{user?.email ?? 'Find your next favorite place'}</span>
      </div>
      <button
        bind:this={closeButton}
        class="close-button"
        type="button"
        aria-label="Close navigation menu"
        onclick={() => closeMenu(true)}
      >
        <X size={22} />
      </button>
    </header>

    <div class="menu-scroll">
      <nav aria-label="Mobile navigation">
        <section class="menu-section" aria-labelledby="browse-heading">
          <h2 id="browse-heading">Browse</h2>
          <ul>
            {#each browseItems as item}
              <li>
                <a
                  href={item.href}
                  class:active={isActive(item.href)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onclick={() => closeMenu()}
                >
                  <item.icon size={20} strokeWidth={2} />
                  <span>{item.label}</span>
                </a>
              </li>
            {/each}
          </ul>
        </section>

        <section class="menu-section app-section" aria-labelledby="app-heading">
          <h2 id="app-heading">App</h2>
          <ul>
            {#if user}
              <li>
                <a
                  href="/settings"
                  class:active={isActive('/settings')}
                  aria-current={isActive('/settings') ? 'page' : undefined}
                  onclick={() => closeMenu()}
                >
                  <Settings size={20} strokeWidth={2} />
                  <span>Settings &amp; location</span>
                </a>
              </li>
              <li>
                <button class="logout-button" type="button" onclick={logout}>
                  <LogOut size={20} strokeWidth={2} />
                  <span>Log out</span>
                </button>
              </li>
            {:else}
              <li>
                <a href="/login" onclick={() => closeMenu()}>
                  <LogIn size={20} strokeWidth={2} />
                  <span>Log in</span>
                </a>
              </li>
            {/if}
          </ul>
        </section>
      </nav>

      <p class="menu-signature"><Navigation size={14} /> Bite Marks</p>
    </div>

    {#if user}
      <footer class="menu-footer">
        <a class="add-spot-button" href="/" onclick={() => closeMenu()}>
          <Plus size={19} />
          Add a spot
        </a>
      </footer>
    {/if}
  </div>
{/if}

<style>
  .menu-trigger,
  .close-button {
    width: 2.75rem;
    height: 2.75rem;
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--comp-header-menu-border);
    border-radius: var(--sys-radius-control);
    background: var(--sys-color-surface-sunken);
    color: var(--comp-header-menu-text);
    cursor: pointer;
  }

  .menu-trigger:focus-visible,
  .close-button:focus-visible,
  .menu-drawer a:focus-visible,
  .menu-drawer button:focus-visible {
    outline: none;
    box-shadow: var(--comp-focus-ring);
  }

  .menu-scrim {
    position: fixed;
    inset: 0;
    z-index: 80;
    width: 100%;
    height: 100%;
    border: 0;
    background: var(--comp-menu-scrim);
    cursor: default;
  }

  .menu-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 81;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(88vw, 27rem);
    min-height: 100vh;
    min-height: 100dvh;
    overflow: hidden;
    border-left: 1px solid var(--comp-menu-border);
    border-radius: var(--sys-radius-3xl) 0 0 var(--sys-radius-3xl);
    background: var(--comp-menu-bg);
    box-shadow: var(--sys-shadow-overlay);
    color: var(--sys-color-text);
  }

  .account-header {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.875rem;
    padding: max(1.125rem, env(safe-area-inset-top)) 1.125rem 1rem;
    border-bottom: 1px solid var(--comp-menu-border);
  }

  .account-avatar {
    display: grid;
    width: 3.25rem;
    height: 3.25rem;
    place-items: center;
    border: 2px solid var(--sys-color-brand);
    border-radius: var(--sys-radius-control);
    background: var(--sys-color-brand-tint);
    color: var(--sys-color-brand);
    font-size: 1.125rem;
    font-weight: 800;
  }

  .account-copy {
    min-width: 0;
  }

  .account-copy strong,
  .account-copy span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-copy strong {
    color: var(--sys-color-text);
    font-size: 1.0625rem;
    line-height: 1.25;
  }

  .account-copy span {
    margin-top: 0.125rem;
    color: var(--sys-color-text-muted);
    font-size: 0.75rem;
  }

  .close-button {
    width: 2.625rem;
    height: 2.625rem;
  }

  .menu-scroll {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 1.25rem 0 2rem;
  }

  .menu-section h2 {
    margin: 0 1.5rem 0.5rem;
    color: var(--comp-section-label-text);
    font-family: var(--sys-font-mono);
    font-size: var(--comp-section-label-size);
    font-weight: var(--comp-section-label-weight);
    letter-spacing: var(--comp-section-label-spacing);
    text-transform: uppercase;
  }

  .menu-section ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .menu-section a,
  .menu-section button {
    position: relative;
    display: grid;
    width: 100%;
    min-height: 3.5rem;
    grid-template-columns: 1.5rem minmax(0, 1fr);
    align-items: center;
    gap: 0.875rem;
    border: 0;
    background: transparent;
    padding: 0.75rem 1.5rem;
    color: var(--sys-color-text);
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 700;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }

  .menu-section a :global(svg),
  .menu-section button :global(svg) {
    color: var(--sys-color-text-muted);
  }

  .menu-section a:hover,
  .menu-section button:hover {
    background: var(--sys-color-surface-raised);
    color: var(--sys-color-text);
  }

  .menu-section a.active {
    background: var(--sys-color-brand-tint);
  }

  .menu-section a.active::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 0.2rem;
    background: var(--sys-color-brand);
  }

  .menu-section a.active :global(svg) {
    color: var(--sys-color-brand);
  }

  .app-section {
    margin: 1rem 1.5rem 0;
    padding-top: 1.125rem;
    border-top: 1px solid var(--comp-menu-border);
  }

  .app-section h2 {
    margin-inline: 0;
  }

  .app-section a,
  .app-section button {
    margin-inline: -1.5rem;
    width: calc(100% + 3rem);
  }

  .app-section .logout-button {
    color: var(--sys-color-error-text);
  }

  .app-section .logout-button :global(svg) {
    color: var(--sys-color-error);
  }

  .menu-signature {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin: 1.5rem 1.5rem 0;
    color: var(--sys-color-text-muted);
    font-family: var(--sys-font-mono);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .menu-footer {
    padding: 1rem 1.125rem max(1rem, env(safe-area-inset-bottom));
    border-top: 1px solid var(--comp-menu-border);
    background: var(--comp-menu-bg);
  }

  .add-spot-button {
    display: flex;
    min-height: 3.5rem;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    border-radius: var(--comp-btn-primary-radius);
    background: var(--comp-btn-primary-bg);
    color: var(--comp-btn-primary-text);
    font-size: 0.8125rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .add-spot-button:hover {
    background: var(--comp-btn-primary-bg-hover);
    color: var(--comp-btn-primary-text);
  }

  @media (prefers-reduced-motion: reduce) {
    .menu-scrim,
    .menu-drawer {
      transition: none;
    }
  }

  @media (min-width: 768px) {
    .menu-trigger {
      display: none;
    }
  }
</style>
