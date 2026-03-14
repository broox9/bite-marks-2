<script lang="ts">
  import { Star, SquareChevronLeftIcon } from '@lucide/svelte';
  import { page } from '$app/state';
  import { getSpotById, updateSpot } from '$lib/adapters/primary/remote-handlers/spots.remote';
  import { invalidateAll } from '$app/navigation';
  import { getPlacePhotoUrl } from '$lib/adapters/secondary/google/google.svelte';
  import { Input, Button, Checkbox, Textarea, SubmitButton } from '$components/ui';

  const spotQuery = getSpotById({ id: page.params.id ?? '' });
  const maxPhotoWidth = 800;
  const maxPhotoHeight = 1200;

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
      getPlacePhotoUrl(spotQuery.current.place_id, maxPhotoWidth, maxPhotoHeight)
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

<div class="content-container">
  {#if spotQuery.loading}
    <p>Loading spot...</p>
  {:else if spotQuery.error}
    <div class="error">
      <p>Error loading spot: {spotQuery.error}</p>
    </div>
  {:else if spotQuery.current}
    {@const spot = spotQuery.current}
    <div class="">
      <a href={`/list#${spot.id}`} class="flex flex-row gap-1 items-center"><SquareChevronLeftIcon size={20} /> Back to list</a>
      <!-- Place Photo -->
      {#if photoLoading}
        <div id="photo-container" class="animate-pulse flex items-center justify-center">
          <span class="text-gray-400">Loading photo...</span>
        </div>
      {:else if photoUrl}
        <div id="photo-container">
          <img
            src={photoUrl}
            alt={spot.name}
            class=""
          />
        </div>
      {/if}

      <!-- Place Information (Read-only) -->
      <section>
        <h1 class="text-2xl font-bold mb-2">{spot.name}</h1>
        <div class="text-gray-600 mb-1">{spot.address}</div>
        {#if spot.rating}
          <div class="text-sm text-gray-500">Rating: {spot.rating}</div>
        {/if}
        {#if spot.websiteURI}
          <a href={spot.websiteURI} target="_blank" rel="noopener noreferrer">
            Visit Website
          </a>
        {/if}
      </section>

      <!-- Editable Fields -->
      <section id="editable-fields-section">
        <!-- Personal Rating -->
        <section id="rating-section"class="ui-input-with-button">
          <label for="personal-rating">
            <span>My Rating</span>
            <input
              id="personal-rating"
              type="number"
              min="0"
              max="5"
              step="0.25"
              bind:value={personalRating}
              placeholder="Rate 0-5"
            />
          </label>

          <div id="spot-rating">
            {spot.rating}
            <Star size={20} />
          </div>

          <!-- Is Visited -->
          <label for="is-visited" id="is-visited-label">
            <Checkbox
              id="is-visited"
              name="is-visited"
              checked={isVisited}
              onchange={(event) => {
                const target = event.currentTarget as HTMLInputElement;
                isVisited = target.checked;
              }}
            />
            <span>Is visited?</span>
          </label>
        </section>

        <!-- Personal Notes -->
        <div id="personal-notes-section">
          <label for="personal-notes" class="block text-sm font-medium mb-1">
            My Notes
          </label>
          <textarea
            id="personal-notes"
            bind:value={personalNotes}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Add your personal notes..."
          ></textarea>
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
                <Button
                  type="button"
                  data-variant="danger"
                  onclick={() => removeSocialLink(index)}
                >
                  Remove
                </Button>
              </div>
            {/each}
            <Button
              type="button"
              onclick={addSocialLink}
            >
              + Add Social Link
            </Button>
          </div>
        </div>

        <!-- Save Button -->
        <div class="pt-4">
          <SubmitButton
            onclick={handleSave}
            disabled={isSaving || !rowId}
            data-width="full"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </SubmitButton>
        </div>
      </section>
    </div>
  {:else}
    <p>Spot not found</p>
  {/if}
</div>

<style>
 section {
  padding: var(--padding-1);
 }
  .content-container {
    /*min-height: 100vh;*/
    /* display: flex;
    flex-direction: column; */
    /* justify-content: flex-start;
    align-items: flex-start;
    gap: 1rem; */
    margin-bottom: 1rem;
    width: 100%;
  }

  #photo-container {
    width: 100%;
    max-height: 25rem;
    object-fit: cover;
    aspect-ratio: 16/9;
    /* overflow: hidden; */
    /* border-radius: var(--border-radius); */
    background-color: var(--bg-low-contrast);

    > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      aspect-ratio: 16/9;
      transition: transform 0.3s ease-in-out;
    }
  }

  #rating-section {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: end;
    gap: 0.5rem;
  }

  #personal-rating {
    padding: var(--padding-1);
    /*width: 6rem;*/
  }

  #spot-rating {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 1ex;
    padding-bottom: var(--padding-1);
  }

  /* label:has(#personal-rating), label:has(#is-visited) {
    flex-basis: 6.25rem;
    width: 6.25rem;
    flex-grow: 0;
    flex-shrink: 0;
  } */

  #is-visited {
    appearance: none;
    cursor: pointer;
    border: none;
    padding: 0;
    display: inline-block;
    position: relative;
    width: 2rem;
    height: 2rem;
  }

  #is-visited::before {
    content: " ";
    /*padding: var(--padding-1);*/
    line-height: 2rem;
    cursor: pointer;
    display: inline-block;
    position: absolute;
    inset: 0;
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--bg-low-contrast);
    /*outline: none;*/
    background-color: transparent;
    border-radius: var(--border-radius);
  }

  #is-visited:checked::before {
    content: '✓';
    /*line-height: 2rem;*/
    color: white;
    text-align: center;
    vertical-align: middle;
    font-size: 1rem;
    background-color: var(--cta-color);
    border-color: var(--cta-color);
  }

  #is-visited-label {
    display: flex;
    gap: 1ex;
    /*flex-basis: 2.5rem;*/
    /*width: 2.5rem;*/
    flex-grow: 1;
    flex-shrink: 0;
    justify-self: flex-end;
    padding-bottom: var(--padding-1);
  }


  #personal-notes-section {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
  }
</style>
