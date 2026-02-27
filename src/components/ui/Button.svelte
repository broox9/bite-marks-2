<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props extends Omit<Record<string, unknown>, 'class'> {
    type?: 'button' | 'submit' | 'reset'
    class?: string
    disabled?: boolean
    children?: Snippet
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let {
    type = 'button',
    class: className = '',
    children,
    'data-size': dataSize,
    'data-variant': dataVariant,
    ...rest
  }: Props = $props()
</script>

<button
  type={type}
  class="ui-button {className}"
  data-size={dataSize}
  data-variant={dataVariant}
  {...rest}
>{@render children?.()}</button>
