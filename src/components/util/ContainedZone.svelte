<script lang="ts">
  let { cssClasses = "", children } = $props();
</script>

<div class="contained-zone {cssClasses}">
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
