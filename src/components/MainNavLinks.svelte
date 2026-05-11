<script lang="ts">
  interface Props {
    ariaLabel?: string;
    class?: string;
  }

  let { ariaLabel = "Site navigation", class: className = "" }: Props = $props();
</script>

<nav class="main-nav-links {className}" aria-label={ariaLabel}>
  <ul>
    <li><a href="/list">Spots</a></li>
    <li><a href="/">Search</a></li>
    <li><a href="/tags">Tags</a></li>
  </ul>
</nav>

<style>
  .main-nav-links ul {
    display: flex;
    list-style: none;
    gap: 1rem;
    margin: 0;
    padding: 0;
  }

  .main-nav-links ul li a {
    color: var(--accent-color);
  }
</style>
