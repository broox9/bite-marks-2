<script lang="ts">
  import Input from './Input.svelte';

  interface Props extends Omit<Record<string, unknown>, 'class' | 'type'> {
    class?: string
    value?: string
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let { ...rest }: Props = $props()
</script>

<Input type="search" {...rest} />
