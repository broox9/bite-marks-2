<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string
    /** The input element(s) */
    input?: Snippet
    /** The button or action element(s) */
    action?: Snippet
    /** Layout: input then button, or button then input */
    'data-order'?: 'input-action' | 'action-input'
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let {
    class: className = '',
    input,
    action,
    'data-order': dataOrder = 'input-action',
    'data-size': dataSize,
    'data-variant': dataVariant
  }: Props = $props()
</script>

<div
  class="ui-input-with-button {className}"
  data-order={dataOrder}
  data-size={dataSize}
  data-variant={dataVariant}
  role="group"
>
  {#if dataOrder === 'action-input'}
    {#if action}<span class="ui-input-with-button__action">{@render action()}</span>{/if}
    {#if input}<span class="ui-input-with-button__input">{@render input()}</span>{/if}
  {:else}
    {#if input}<span class="ui-input-with-button__input">{@render input()}</span>{/if}
    {#if action}<span class="ui-input-with-button__action">{@render action()}</span>{/if}
  {/if}
</div>
