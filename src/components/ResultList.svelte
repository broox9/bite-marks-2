<script lang="ts">
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import { MapPin, ChevronRight } from '@lucide/svelte';

  const { items, onSelect, query = '' } : { items: ResultPlaceRecord[], onSelect: any, query?: string } = $props()

  function highlight(name: string, q: string): { text: string; match: boolean }[] {
    if (!q) return [{ text: name, match: false }];
    const idx = name.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return [{ text: name, match: false }];
    return [
      { text: name.slice(0, idx), match: false },
      { text: name.slice(idx, idx + q.length), match: true },
      { text: name.slice(idx + q.length), match: false },
    ].filter(p => p.text.length > 0);
  }
</script>

<section class="results-section">
  <p class="section-label">Top Matches</p>
  <ul class="results-list" role="listbox" id="results-list" aria-label="Search results">
    {#each items as item, i}
      <li
        class="result-item"
        role="option"
        aria-selected={false}
        onclick={() => onSelect(item)}
        data-spot-id={item.place_id}
      >
        <span class="result-pin"><MapPin size={16} /></span>
        <span class="result-body">
          <span class="result-name">
            {#each highlight(item.name, query) as part}
              {#if part.match}<mark class="match">{part.text}</mark>{:else}{part.text}{/if}
            {/each}
          </span>
          <span class="result-sub">{item.neighborhood}</span>
        </span>
        <ChevronRight size={16} class="result-chevron" />
      </li>
      {#if i < items.length - 1}
        <li class="divider" role="presentation"></li>
      {/if}
    {/each}
  </ul>
</section>

<style>
  .results-section {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .section-label {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: var(--comp-section-label-weight);
    letter-spacing: var(--comp-section-label-spacing);
    text-transform: uppercase;
    color: var(--comp-section-label-text);
  }

  .results-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    cursor: pointer;
    border-radius: 0;
  }

  .result-item:hover .result-name {
    color: var(--comp-list-item-bg-hover);
  }

  .result-pin {
    flex-shrink: 0;
    color: var(--sys-color-brand);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background-color: var(--sys-color-brand-tint);
    border-radius: var(--sys-radius-pill);
  }

  .result-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .result-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--comp-list-item-text);
    line-height: 1.3;
  }

  .match {
    color: var(--comp-drawer-match-text);
    background: none;
    font-weight: 700;
  }

  .result-sub {
    font-size: 0.8125rem;
    color: var(--comp-list-item-text-sub);
    line-height: 1.3;
  }

  :global(.result-chevron) {
    flex-shrink: 0;
    color: var(--comp-list-item-chevron);
  }

  .divider {
    height: 1px;
    background-color: var(--comp-list-item-divider);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  @media (hover: hover) {
    .result-item:hover {
      background-color: var(--comp-list-item-bg-hover);
      margin: 0 -1rem;
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }
</style>
