<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props extends Omit<Record<string, unknown>, 'class'> {
    type?: 'button' | 'submit' | 'reset'
    class?: string
    disabled?: boolean
    children?: Snippet
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
    'data-width'?: 'fit' | 'full'
  }

  let {
    type = 'button',
    class: className = '',
    children,
    'data-size': dataSize,
    'data-variant': dataVariant,
    'data-width': dataWidth,
    ...rest
  }: Props = $props()
</script>

<button
  type={type}
  class="ui-button {className}"
  data-size={dataSize}
  data-variant={dataVariant}
  data-width={dataWidth}
  {...rest}
>{@render children?.()}</button>
