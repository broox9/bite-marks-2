<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { listTags, createTag } from "$lib/adapters/primary/remote-handlers/tags.remote";

  let newTagName = $state("");
  let isCreating = $state(false);

  const tagsQuery = listTags({});

  const handleCreateTag = async (event: Event) => {
    event.preventDefault();
    if (!newTagName.trim()) return;

    isCreating = true;
    try {
      await createTag({ tagName: newTagName.trim() });
      newTagName = "";
      await invalidateAll();
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      isCreating = false;
    }
  };
</script>

<div id="page-container">
  <section id="search-container">
    <form onsubmit={handleCreateTag} class="p-4">
      <h3 class="text-lg font-semibold mb-3">Create New Tag</h3>
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={newTagName}
          placeholder="Enter tag name"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isCreating}
        />
        <button
          type="submit"
          disabled={isCreating || !newTagName.trim()}
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  </section>

  <section id="map-container">
    Map here
  </section>

  <section id="tags-list">
    <h3>Tags</h3>
    {#if tagsQuery.loading}
      <p>Loading…</p>
    {:else if !tagsQuery.current || tagsQuery.current.length === 0}
      <p>No tags found</p>
    {:else}
      <ul>
        {#each tagsQuery.current as tag (tag.id)}
          <li>
            <span>{tag.tagName}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<style>
  #page-container {
    display: grid;
    gap: 1rem;
    padding: 1rem;
  }

  #tags-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  #tags-list li {
    padding: 0.5rem 0.75rem;
    background: var(--bg-light, #f5f5f5);
    border-radius: 0.375rem;
  }
</style>
