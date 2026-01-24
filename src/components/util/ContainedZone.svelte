<script lang="ts">
	let { cssClasses = '', children } = $props();

  const classList = `${cssClasses} w-full max-w-5xl`
</script>

<div class="flex justify-center">
  <div class={classList}>
    {@render children()}
  </div>
</div>