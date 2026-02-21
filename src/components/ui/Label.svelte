<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props extends Omit<Record<string, unknown>, 'class'> {
    for?: string
    class?: string
    children?: Snippet
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let {
    class: className = '',
    children,
    'data-size': dataSize,
    'data-variant': dataVariant,
    ...rest
  }: Props = $props()
</script>

<label
  class="ui-label {className}"
  data-size={dataSize}
  data-variant={dataVariant}
  {...rest}
>
  {@render children?.()}
</label>
