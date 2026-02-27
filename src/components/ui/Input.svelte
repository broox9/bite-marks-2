<script lang="ts">
  interface Props extends Omit<Record<string, unknown>, 'class'> {
    type?: string
    class?: string
    value?: string
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let {
    type = 'text',
    class: className = '',
    'data-size': dataSize,
    'data-variant': dataVariant,
    ...rest
  }: Props = $props()
</script>

<input
  type={type}
  class="ui-input {className}"
  data-size={dataSize}
  data-variant={dataVariant}
  {...rest}
/>
