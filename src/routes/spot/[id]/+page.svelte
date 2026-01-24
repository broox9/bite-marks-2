<script lang="ts">
  import { page } from '$app/state';
  import { getSpotById, updateSpot } from '$lib/adapters/primary/remote-handlers/spots.remote';
  import { invalidateAll } from '$app/navigation';
  import { getPlacePhotoUrl } from '$lib/adapters/secondary/google/google.svelte';

  const spotQuery = getSpotById({ id: page.params.id ?? '' });

  let personalRating = $state<number | null>(null);
  let personalNotes = $state<string | null>(null);
  let isVisited = $state<boolean>(false);
  let socialLinks = $state<string[]>([]);
  let rowId = $state<string | null>(null);
  let isSaving = $state(false);
  let photoUrl = $state<string | null>(null);
  let photoLoading = $state(false);

  // Update local state when spot data loads
  $effect(() => {
    if (spotQuery.current) {
      const spot = spotQuery.current;
      personalRating = spot.personal_rating ?? null;
      personalNotes = spot.personal_notes ?? null;
      isVisited = spot.is_visited ?? false;
      socialLinks = spot.social_links ?? [];
      rowId = (spot as any).rowId ?? null;
    }
  });

  // Load place photo when spot data is available
  $effect(() => {
    if (spotQuery.current?.place_id && !photoUrl && !photoLoading) {
      photoLoading = true;
      getPlacePhotoUrl(spotQuery.current.place_id, 400, 600)
        .then((url) => {
          photoUrl = url;
        })
        .finally(() => {
          photoLoading = false;
        });
    }
  });

  async function handleSave() {
    if (!rowId) {
      console.error('No rowId available for update');
      return;
    }

    isSaving = true;
    try {
      await updateSpot({
        rowId,
        data: {
          personal_rating: personalRating,
          personal_notes: personalNotes,
          is_visited: isVisited,
          social_links: socialLinks,
        },
      });
      invalidateAll();
    } catch (error) {
      console.error('Failed to update spot:', error);
    } finally {
      isSaving = false;
    }
  }

  function addSocialLink() {
    socialLinks = [...socialLinks, ''];
  }

  function removeSocialLink(index: number) {
    socialLinks = socialLinks.filter((_, i) => i !== index);
  }

  function updateSocialLink(index: number, value: string) {
    socialLinks = socialLinks.map((link, i) => (i === index ? value : link));
  }
</script>

<div class="container mx-auto p-4 max-w-2xl">
  {#if spotQuery.loading}
    <p>Loading spot...</p>
  {:else if spotQuery.error}
    <div class="error">
      <p>Error loading spot: {spotQuery.error}</p>
    </div>
  {:else if spotQuery.current}
    {@const spot = spotQuery.current}
    <div class="space-y-6">
      <a href={`/list#${spot.id}`}> &lt; Back to list</a>
      <!-- Place Photo -->
      {#if photoLoading}
        <div class="w-full h-48 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
          <span class="text-gray-400">Loading photo...</span>
        </div>
      {:else if photoUrl}
        <div class="w-full rounded-lg overflow-hidden">
          <img 
            src={photoUrl} 
            alt={spot.name} 
            class="w-full h-48 object-cover"
          />
        </div>
      {/if}

      <!-- Place Information (Read-only) -->
      <section class="bg-gray-50 p-4 rounded-lg">
        <h1 class="text-2xl font-bold mb-2">{spot.name}</h1>
        <p class="text-gray-600 mb-1">{spot.address}</p>
        {#if spot.rating}
          <p class="text-sm text-gray-500">Rating: {spot.rating}</p>
        {/if}
        {#if spot.websiteURI}
          <a href={spot.websiteURI} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-sm">
            Visit Website
          </a>
        {/if}
      </section>

      <!-- Editable Fields -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Your Notes</h2>

        <!-- Personal Rating -->
        <div>
          <label for="personal-rating" class="block text-sm font-medium mb-1">
            Personal Rating
          </label>
          <input
            id="personal-rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            bind:value={personalRating}
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Rate 0-5"
          />
        </div>

        <!-- Personal Notes -->
        <div>
          <label for="personal-notes" class="block text-sm font-medium mb-1">
            Personal Notes
          </label>
          <textarea
            id="personal-notes"
            bind:value={personalNotes}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Add your personal notes..."
          ></textarea>
        </div>

        <!-- Is Visited -->
        <div class="flex items-center">
          <input
            id="is-visited"
            type="checkbox"
            bind:checked={isVisited}
            class="mr-2"
          />
          <label for="is-visited" class="text-sm font-medium">
            I've visited this place
          </label>
        </div>

        <!-- Social Links -->
        <div>
          <label for="social-links" class="block text-sm font-medium mb-1">
            Social Links
          </label>
          <div class="space-y-2">
            {#each socialLinks as link, index}
              <div class="flex gap-2">
                <input
                  type="text"
                  value={link}
                  oninput={(e) => {
                    const target = e.target as HTMLInputElement;
                    updateSocialLink(index, target.value);
                  }}
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onclick={() => removeSocialLink(index)}
                  class="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            {/each}
            <button
              type="button"
              onclick={addSocialLink}
              class="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              + Add Social Link
            </button>
          </div>
        </div>

        <!-- Save Button -->
        <div class="pt-4">
          <button 
            type="submit" 
            onclick={handleSave}
            disabled={isSaving || !rowId}
            class="w-full px-4 py-2"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </section>
    </div>
  {:else}
    <p>Spot not found</p>
  {/if}
</div>

<style>
  .container {
    min-height: 100vh;
  }
</style>
