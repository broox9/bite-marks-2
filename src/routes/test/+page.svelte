<script lang="ts">
  const detailsLinks = [
    { href: '/test/details-test/design-1', label: 'Details Design 1' },
    { href: '/test/details-test/design-2', label: 'Details Design 2' },
    { href: '/test/details-test/design-3', label: 'Details Design 3' },
    { href: '/test/details-test/design-4', label: 'Details Design 4' },
  ];

  const listingsLinks = [
    { href: '/test/listings-test/design-1', label: 'Listings Design 1' },
    { href: '/test/listings-test/design-2', label: 'Listings Design 2' },
    { href: '/test/listings-test/design-3', label: 'Listings Design 3' },
    { href: '/test/listings-test/design-4', label: 'Listings Design 4' },
  ];

  const generatedLinks = [
    { href: '/test/pencil-step-3', label: 'Pencil Step 3 (Generated)' },
  ];
</script>

<div class="max-w-2xl mx-auto p-8 space-y-10">
  <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Test Pages</h1>

  <section>
    <h2 class="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-3">Details Test</h2>
    <ul class="space-y-2">
      {#each detailsLinks as link}
        <li>
          <a
            href={link.href}
            class="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline"
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </section>

  <section>
    <h2 class="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-3">Listings Test</h2>
    <ul class="space-y-2">
      {#each listingsLinks as link}
        <li>
          <a
            href={link.href}
            class="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline"
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </section>

  <section>
    <h2 class="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-3">Pencil Generated</h2>
    <ul class="space-y-2">
      {#each generatedLinks as link}
        <li>
          <a
            href={link.href}
            class="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline"
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </section>
</div>
