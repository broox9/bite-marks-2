<script lang="ts">
  const { children, cssClass = '' } = $props()
</script>


<div class="card p-4 rounded-xl {cssClass}">
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
