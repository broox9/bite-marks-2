<script lang="ts">
  import { Compass, List, Navigation, Tags, UserRound } from '@lucide/svelte';
  import { page } from '$app/state';

  const items = [
    { label: 'Spots', href: '/list', icon: Compass },
    { label: 'List', href: '/all-spots', icon: List },
    { label: 'Tags', href: '/tags', icon: Tags },
    { label: 'Nearby', href: '/', icon: Navigation },
    { label: 'Me', href: '/settings', icon: UserRound },
  ];

  function isActive(href: string) {
    if (href === '/') return page.url.pathname === '/';
    return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
  }
</script>

<nav class="bottom-nav" aria-label="Primary navigation">
  {#each items as item}
    <a href={item.href} class:active={isActive(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}>
      <item.icon size={17} strokeWidth={2.15} />
      <span>{item.label}</span>
    </a>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 40;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    min-height: var(--comp-nav-height);
    padding: 0.45rem 0 max(0.55rem, env(safe-area-inset-bottom));
    border-top: 1px solid var(--comp-nav-border);
    background: var(--comp-nav-bg);
  }

  .bottom-nav a {
    display: flex;
    min-width: 0;
    min-height: 2.75rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;
    color: var(--comp-nav-inactive);
    font-family: var(--sys-font-mono);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.015em;
    line-height: 1;
    text-decoration: none;
  }

  .bottom-nav a.active {
    color: var(--comp-nav-active);
  }

  .bottom-nav span {
    overflow: hidden;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bottom-nav a:focus-visible {
    outline: none;
    box-shadow: inset var(--comp-focus-ring);
  }

  @media (min-width: 768px) {
    .bottom-nav {
      display: none;
    }
  }
</style>
