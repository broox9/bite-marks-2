<script lang="ts">
  import Button from './Button.svelte';

  interface Props extends Omit<Record<string, unknown>, 'class'> {
    class?: string
    disabled?: boolean
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let { ...rest }: Props = $props()
</script>

<Button type="submit" {...rest} />
