<script lang="ts">
  import { listTagsController, createTagController } from "$lib/adapters/primary/tags.driver";
  import { storeGetCurrentUser } from "$lib/adapters/primary/stores/user.store.svelte";

  let tagsList :any[] = $state([])
  let newTagName = $state('')
  let isCreating = $state(false)

  const setTagList = (tags: any[]) => {
    tagsList = tags
    console.log('[bs] page::TAGS LIST SET', tagsList)
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    
    isCreating = true
    try {
      const user: any = await storeGetCurrentUser()
      await createTagController({
        tag: {
          tagName: newTagName.trim(),
          userId: user.$id
        },
        callback: (result: any) => {
          if (result) {
            newTagName = ''
            // Refresh the tags list
            listTagsController({ userId: user.$id, callback: setTagList })
          }
        }
      })
    } catch (error) {
      console.error('Failed to create tag:', error)
    } finally {
      isCreating = false
    }
  }

  $effect(() => {
    storeGetCurrentUser()
    .then(async (user: any) => await listTagsController({ userId: user.$id, callback: setTagList }))
    .catch(console.error)

  })
</script>


<div id="page-container">
  <section id="search-container">
    <form on:submit|preventDefault={handleCreateTag} class="p-4">
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
          {isCreating ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  </section>

  <section id="map-container">
    Map here
  </section>

  <section id="tags-list">
    <h3>Tags</h3>
    {#if tagsList.length === 0}
      <p>No tags found</p>
    {:else}
      {#each tagsList as tag}
        <div class="p-3">
        <strong>
          <a href="tag/{tag.id}">{tag.tagName}</a>
        </strong>
        <br />
        <small>Created: {new Date(tag.createdAt).toLocaleDateString()}</small>
        </div>

      {/each}
    {/if}
  </section>
</div>

<a href="/" id="floating-search-button">Search</a>


<style>
#page-container {
  display: grid;
  grid-template-areas:
    "map"
    "tags"
    "search";
  grid-template-rows: auto 1fr auto auto;
  height: 100svh;
  max-height: 100svh;
}

#search-container {
  grid-area: unset;
  background-color: hsla(200, 50%, 50%, 0.25);
  height: auto;
}

#map-container {
  grid-area: map;
  background-color: hsla(100, 50%, 50%, 0.25);
}

#tags-list {
  grid-area: tags;
  overflow-y: scroll;
  background-color: hsla(300, 50%, 50%, 0.25);
  min-height: 300px;
  padding-bottom: 3rem;
}

#floating-search-button {
    position: fixed;
    bottom: 1.5rem;
    right: 1rem;
    display: block;
    border-radius: 100svh;
    background-color: lightblue;
    padding: 0.5rem;
    z-index: 5;
  }

@media (min-width: 768px) {
  #page-container {
    grid-template-areas:
      "tags search"
      "tags map";
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr minmax(300px, 500px);
  }

  #search-container {
    grid-area: search;
  }

  #floating-search-button {
    display: none;
  }
}

</style>