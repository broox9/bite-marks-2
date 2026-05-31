<script lang="ts">
  import { Search, Clock } from '@lucide/svelte';
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import { resultsListController } from "$lib/adapters/primary/place-search.driver";
  import ResultList from './ResultList.svelte';

  const QUICK_FILTERS = [
    ['Open now', 'Visited', 'To try', 'Within 5 mi'],
    ['★ 4.5+', 'Steak', 'Italian', 'Late night'],
  ];

  const RECENT: string[] = [];

  let currentSearchValue = $state('')
  let resultList = $state<ResultPlaceRecord[] | []>([])
  let selectedResult = $state<ResultPlaceRecord | null>(null)

  let props = $props()
  let { selectResultAction } = props

  const resultHandler = (results: ResultPlaceRecord[]) => {
    resultList = results
  }

  async function searchHandler(e: Event) {
    const value = (e.currentTarget as HTMLInputElement | null)?.value;
    if (!value || value.length < 3) {
      resultList = [];
      return
    }
    await resultsListController({value, type: 'places', callback: resultHandler})
  }

  function selectResult(selectedPlace: ResultPlaceRecord) {
    selectedResult = selectedPlace
    selectResultAction(selectedPlace)
    listClearAction()
  }

  function listClearAction() {
    selectedResult = null
    resultList = []
    currentSearchValue = ''
  }
</script>

<div class="search-drawer">
  <div class="search-bar-row">
    <label class="search-pill">
      <Search size={15} class="search-icon" />
      <input
        type="search"
        bind:value={currentSearchValue}
        oninput={searchHandler}
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="results-list"
        aria-expanded={!!resultList.length}
        placeholder="Search for a spot"
      />
    </label>
    <button type="button" class="cancel-btn" onclick={listClearAction}>Cancel</button>
  </div>

  {#if resultList.length > 0}
    <ResultList items={resultList} onSelect={selectResult} query={currentSearchValue} />
  {:else}
    <!-- <div class="drawer-section">
      <p class="section-label">Quick Filters</p>
      <div class="filter-chips">
        {#each QUICK_FILTERS as row}
          <div class="filter-row">
            {#each row as chip}
              <button type="button" class="filter-chip">{chip}</button>
            {/each}
          </div>
        {/each}
      </div>
    </div> -->

    {#if RECENT.length > 0}
      <div class="drawer-section">
        <p class="section-label">Recent</p>
        <ul class="recent-list">
          {#each RECENT as item, i}
            <li class="recent-item">
              <Clock size={14} class="recent-icon" />
              <span>{item}</span>
            </li>
            {#if i < RECENT.length - 1}
              <li class="divider" role="presentation"></li>
            {/if}
          {/each}
        </ul>
      </div>
    {/if}
  {/if}
</div>

<style>
  .search-drawer {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 0.75rem 1rem 1rem;
  }

  .search-bar-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .search-pill {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--comp-input-search-bg);
    border-radius: var(--comp-input-search-radius);
    padding: 0.5rem 0.875rem;
    min-height: 2.5rem;
    cursor: text;
  }

  .search-pill :global(.search-icon) {
    color: var(--sys-color-text-muted);
    flex-shrink: 0;
  }

  .search-pill input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    outline: none;
    font: inherit;
    color: var(--sys-color-text);
    line-height: 1.25;
  }

  .search-pill input::placeholder {
    color: var(--sys-color-text-muted);
  }

  .search-pill input[type="search"]::-webkit-search-cancel-button {
    display: none;
  }

  .cancel-btn {
    background: none;
    border: none;
    padding: 0.25rem;
    color: var(--comp-btn-link-text);
    font: inherit;
    font-weight: 500;
    font-size: 0.9375rem;
    white-space: nowrap;
    cursor: pointer;
  }

  .cancel-btn:hover {
    color: var(--comp-btn-link-text-hover);
  }

  .drawer-section {
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

  .filter-chips {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .filter-chip {
    background: var(--comp-filter-chip-bg);
    border: 1px solid var(--comp-filter-chip-border);
    border-radius: var(--comp-filter-chip-radius);
    color: var(--comp-filter-chip-text);
    padding: var(--comp-filter-chip-padding);
    font: inherit;
    font-size: 0.875rem;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .filter-chip:hover {
    background-color: var(--sys-color-surface-raised);
  }

  .recent-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .recent-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 0;
    color: var(--sys-color-text);
    font-size: 0.9375rem;
  }

  .recent-item :global(.recent-icon) {
    color: var(--sys-color-text-muted);
    flex-shrink: 0;
  }

  .divider {
    height: 1px;
    background-color: var(--comp-list-item-divider);
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
