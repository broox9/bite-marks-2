<script lang="ts">
  let { cssClasses = "", children } = $props();

  const classList = `${cssClasses}`;
</script>

<div class="contained-zone">
  {@render children()}
</div>

<style>
  .contained-zone {
    max-width: 1024px;
    margin: 0 auto;
    /* display: flex;
    justify-content: center;
    align-items: center; */
  }
</style>
