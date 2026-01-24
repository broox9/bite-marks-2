<script lang="ts">
  const { children, title='', cssClass = '' } = $props()
  const classList = `card p-4 rounded-xl ${cssClass}`
</script>


<div class={classList}>
  <div class="card-body">
    {@render children()}
  </div>
</div>


<style>
  .card {
    box-shadow:
      1px 1px 4px #bbb,
      0px 0px 10px 10px #ddd;

  }
</style>
