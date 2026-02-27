<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string
    children?: Snippet
    /** Content before the main input (e.g. icon, prefix) */
    leading?: Snippet
    /** Content after the main input (e.g. icon, suffix, button) */
    trailing?: Snippet
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let {
    class: className = '',
    children,
    leading,
    trailing,
    'data-size': dataSize,
    'data-variant': dataVariant
  }: Props = $props()
</script>

<div
  class="ui-input-group {className}"
  data-size={dataSize}
  data-variant={dataVariant}
  role="group"
>
  {#if leading}
    <span class="ui-input-group__leading">{@render leading()}</span>
  {/if}
  <span class="ui-input-group__input">
    {@render children?.()}
  </span>
  {#if trailing}
    <span class="ui-input-group__trailing">{@render trailing()}</span>
  {/if}
</div>
