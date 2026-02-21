<script lang="ts">
  interface Props extends Omit<Record<string, unknown>, 'class'> {
    type?: string
    class?: string
    value?: string | undefined
    'data-size'?: 'sm' | 'md' | 'lg'
    'data-variant'?: string
  }

  let {
    type = 'text',
    class: className = '',
    'data-size': dataSize,
    'data-variant': dataVariant,
    value,
    ...rest
  }: Props = $props()
</script>

<textarea
  class="ui-textarea {className}"
  data-size={dataSize}
  data-variant={dataVariant}
  value={value ?? undefined}
  {...rest}
></textarea>
