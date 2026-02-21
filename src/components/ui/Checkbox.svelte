<script lang="ts">
  interface Props extends Omit<Record<string, unknown>, 'class'> {
    class?: string
    checked?: boolean
    indeterminate?: boolean
    value?: boolean | undefined | null
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let {
    class: className = '',
    'data-size': dataSize,
    'data-variant': dataVariant,
    value,
    ...rest
  }: Props = $props()
</script>

<input
  type="checkbox"
  class="ui-checkbox {className}"
  data-size={dataSize}
  data-variant={dataVariant}
  {...rest}
  checked={value ?? false}
/>
