<script lang="ts">
  import Input from './Input.svelte';
  import { Search, Clock } from '@lucide/svelte';
  // import { Component } from 'svelte'

  interface Props extends Omit<Record<string, unknown>, 'class' | 'type'> {
    class?: string
    value?: string
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let { icon, Icon,...rest }: Props = $props()
</script>

<div class="search-bar-row">
  <label class="search-pill">
    <Icon size={15} class="search-icon"/>
    <!-- {#if icon}
      {@render icon()}
    {/if} -->
    <input type="search" {...rest} />
  </label>
  <button type="button" class="cancel-btn" onclick={() => 0}>Cancel</button>
</div>



<style>

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
</style>
