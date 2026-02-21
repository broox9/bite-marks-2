<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string
    children?: Snippet
    /** Orientation of the group */
    'data-orientation'?: 'horizontal' | 'vertical'
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let {
    class: className = '',
    children,
    'data-orientation': dataOrientation = 'horizontal',
    'data-size': dataSize,
    'data-variant': dataVariant
  }: Props = $props()
</script>

<div
  class="ui-button-group {className}"
  data-orientation={dataOrientation}
  data-size={dataSize}
  data-variant={dataVariant}
  role="group"
>
  {@render children?.()}
</div>
