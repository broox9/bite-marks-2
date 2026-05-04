<script lang="ts">
  type Option = { value: string; label: string };
  let { options, selected = $bindable() } = $props<{
    options: Option[];
    selected: string;
  }>();
</script>

<div class="segmented-control" role="radiogroup">
  {#each options as option}
    <button
      type="button"
      class="segment"
      class:active={selected === option.value}
      onclick={() => (selected = option.value)}
      role="radio"
      aria-checked={selected === option.value}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .segmented-control {
    display: inline-flex;
    align-items: stretch;
    background-color: var(--bg-light);
    border-radius: 999px;
    padding: 0.125rem;
    border: 1px solid var(--bg-low-contrast);
    gap: 0.125rem;
  }
  .segment {
    background: transparent;
    border: none;
    padding: 0.25rem 0.625rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--bg-medium-contrast);
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.2s ease;
    line-height: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .segment:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px oklch(from var(--accent-color) l c h / 0.5);
  }
  .segment.active {
    background-color: var(--bg-color);
    color: var(--bg-high-contrast);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
</style>
