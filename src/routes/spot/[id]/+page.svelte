<script lang="ts">
  import {
    ArrowLeft,
    CircleCheck,
    ExternalLink,
    Globe,
    Link2,
    MapPin,
    NotebookText,
    Plus,
    Star,
    Trash2,
  } from '@lucide/svelte';
  import { page } from '$app/state';
  import { getSpotById, updateSpot } from '$lib/adapters/primary/remote-handlers/spots.remote';
  import { invalidateAll } from '$app/navigation';
  import { getPlacePhotoUrl } from '$lib/adapters/secondary/google/google.svelte';
  import { Button, Checkbox, SubmitButton } from '$components/ui';

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
  let saveError = $state<string | null>(null);
  let saveMessage = $state<string | null>(null);

  // Update local state when spot data loads
  $effect(() => {
    if (spotQuery.current) {
      const spot = spotQuery.current;
      personalRating = spot.personal_rating ?? null;
      personalNotes = spot.personal_notes ?? null;
      isVisited = spot.is_visited ?? false;
      socialLinks = spot.social_links ?? [];
      rowId = (spot as { rowId?: string }).rowId ?? null;
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
    saveError = null;
    saveMessage = null;

    if (!rowId) {
      saveError = 'This spot is missing its saved record. Return to the list and open it again.';
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
      await invalidateAll();
      saveMessage = 'Changes saved.';
    } catch (error) {
      saveError = error instanceof Error ? error.message : 'Could not save your changes.';
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

<div class="spot-page">
  {#if spotQuery.loading}
    <section class="state-panel loading-panel" aria-label="Loading spot">
      <div class="skeleton photo-skeleton" aria-hidden="true"></div>
      <div class="skeleton line wide" aria-hidden="true"></div>
      <div class="skeleton line" aria-hidden="true"></div>
      <div class="skeleton block" aria-hidden="true"></div>
    </section>
  {:else if spotQuery.error}
    <section class="state-panel error-panel" role="alert">
      <h1>Could not load this spot</h1>
      <p>{spotQuery.error}</p>
      <a href="/list" class="back-link"><ArrowLeft size={18} />Back to list</a>
    </section>
  {:else if spotQuery.current}
    {@const spot = spotQuery.current}
    <article class="spot-shell">
      <a href={`/list#${spot.id}`} class="back-link"><ArrowLeft size={18} />Back to list</a>

      <section class="spot-hero" aria-labelledby="spot-name">
        <div id="photo-container" data-loading={photoLoading}>
          {#if photoLoading}
            <span>Loading photo</span>
          {:else if photoUrl}
            <img src={photoUrl} alt={spot.name} />
          {:else}
            <MapPin size={28} />
          {/if}
        </div>

        <div class="spot-summary">
          <h1 id="spot-name">{spot.name}</h1>

          <p id="spot-address"><MapPin size={16} />{spot.address}</p>

          <div class="metadata-row">
            {#if spot.rating}
              <span class="rating-chip" aria-label={`Google rating ${spot.rating}`}>
                <Star size={16} />
                {spot.rating}
              </span>
            {/if}

            {#if spot.websiteURI}
              <a
                href={spot.websiteURI}
                target="_blank"
                rel="noopener noreferrer"
                class="website-link"
              >
                <Globe size={16} />
                Website
                <ExternalLink size={14} />
              </a>
            {/if}

            {#if isVisited}
              <span class="status-chip"><CircleCheck size={15} />Visited</span>
            {/if}
          </div>
        </div>
      </section>

      <section id="editable-fields-section" aria-labelledby="details-heading">
        <div class="section-heading">
          <NotebookText size={20} />
          <div>
            <h2 id="details-heading">Personal details</h2>
          </div>
        </div>

        <div class="rating-grid">
          <label for="personal-rating" class="field-label">
            <span>My rating</span>
            <input
              id="personal-rating"
              class="ui-input"
              type="number"
              min="0"
              max="5"
              step="0.25"
              size="5"
              bind:value={personalRating}
              placeholder="0-5"
            />
          </label>

          <label for="is-visited" id="is-visited-label">
            <Checkbox
              id="is-visited"
              name="is-visited"
              checked={isVisited}
              onchange={(event: Event) => {
                const target = event.currentTarget as HTMLInputElement;
                isVisited = target.checked;
              }}
            />
            <span>Visited</span>
          </label>
        </div>

        <label for="personal-notes" class="field-label">
          <span>Notes</span>
          <textarea
            id="personal-notes"
            bind:value={personalNotes}
            rows="5"
            class="ui-textarea"
            placeholder="What should you remember before going back?"
          ></textarea>
        </label>

        <div class="field-group">
          <div class="field-group-header">
            <span id="social-links-label" class="field-group-label">Social links</span>
            <Button type="button" data-size="sm" onclick={addSocialLink}>
              <Plus size={16} />
              Add link
            </Button>
          </div>

          {#if socialLinks.length === 0}
            <p class="quiet-note">Add Instagram, TikTok, menu, or review links you want nearby.</p>
          {:else}
            <div class="social-link-list" aria-labelledby="social-links-label">
              {#each socialLinks as link, index}
                <div class="social-link-row">
                  <Link2 size={18} aria-hidden="true" />
                  <input
                    type="url"
                    value={link}
                    oninput={(e) => {
                      const target = e.target as HTMLInputElement;
                      updateSocialLink(index, target.value);
                    }}
                    class="ui-input"
                    aria-label={`Social link ${index + 1}`}
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    class="remove-link-button"
                    aria-label={`Remove social link ${index + 1}`}
                    onclick={() => removeSocialLink(index)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        {#if saveError}
          <p class="save-message error-message" role="alert">{saveError}</p>
        {:else if saveMessage}
          <p class="save-message success-message" role="status">{saveMessage}</p>
        {/if}

        <div class="save-row">
          <SubmitButton
            onclick={handleSave}
            disabled={isSaving || !rowId}
            data-width="full"
          >
            {isSaving ? 'Saving' : 'Save changes'}
          </SubmitButton>
        </div>
      </section>
    </article>
  {:else}
    <section class="state-panel">
      <h1>Spot not found</h1>
      <p>This saved spot may have been removed.</p>
      <a href="/list" class="back-link"><ArrowLeft size={18} />Back to list</a>
    </section>
  {/if}
</div>

<style>
  .spot-page {
    min-height: calc(100svh - 7rem);
    background:
      linear-gradient(90deg, oklch(from var(--bg-low-contrast) l c h / 0.42) 1px, transparent 1px),
      var(--bg-color);
    background-size: 3.75rem 3.75rem;
    color: var(--bg-high-contrast);
  }

  .spot-shell {
    display: grid;
    gap: var(--padding-2);
    width: 100%;
    max-width: 62rem;
    margin: 0 auto;
    padding: var(--padding-2);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    width: fit-content;
    min-height: 2.5rem;
    color: var(--bg-high-contrast);
    font-weight: 650;
  }

  .back-link:hover {
    color: var(--cta-color);
  }

  .back-link:focus-visible,
  .website-link:focus-visible,
  .remove-link-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px oklch(from var(--accent-color) l c h / 0.26);
  }

  .spot-hero {
    display: grid;
    gap: var(--padding-2);
    overflow: hidden;
    border: 1px solid oklch(from var(--bg-low-contrast) calc(l - 0.03) c h);
    border-radius: var(--border-radius);
    background-color: var(--bg-color);
    box-shadow: 0 0.75rem 1.75rem oklch(0.3 0.02 267 / 0.08);
  }

  .spot-summary,
  #editable-fields-section {
    padding: var(--padding-2);
  }

  #photo-container {
    width: 100%;
    aspect-ratio: 16/9;
    display: grid;
    place-items: center;
    background-color: var(--bg-low-contrast);
    color: var(--bg-medium-contrast);
    overflow: hidden;
  }

  #photo-container[data-loading='true'] {
    background: linear-gradient(
      90deg,
      var(--bg-light),
      var(--bg-low-contrast),
      var(--bg-light)
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.3s ease-out infinite;
  }

  #photo-container span {
    border: 1px solid var(--bg-low-contrast);
    border-radius: 999px;
    background-color: oklch(from var(--bg-light) l c h / 0.92);
    padding: 0.375rem 0.75rem;
    color: var(--bg-medium-contrast);
    font-size: 0.875rem;
    font-weight: 650;
  }

  #photo-container > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .spot-summary {
    display: grid;
    align-content: start;
    gap: var(--padding-1);
  }

  .metadata-row,
  .section-heading,
  .field-group-header {
    display: flex;
    align-items: center;
    gap: var(--padding-1);
  }

  .field-group-header {
    justify-content: space-between;
  }

  #spot-name {
    max-width: 16ch;
    margin: 0;
    font-size: 2rem;
    font-weight: 750;
    line-height: 1.05;
    letter-spacing: 0;
  }

  #spot-address {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    max-width: 58ch;
    margin: 0;
    color: var(--bg-medium-contrast);
    font-size: 0.9375rem;
    line-height: 1.4;
  }

  #spot-address :global(svg) {
    flex: 0 0 auto;
    margin-top: 0.1rem;
  }

  .metadata-row {
    flex-wrap: wrap;
    margin-top: 0.25rem;
  }

  .rating-chip,
  .status-chip,
  .website-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 2rem;
    border: 1px solid var(--bg-low-contrast);
    border-radius: 999px;
    background-color: var(--bg-color);
    color: var(--bg-high-contrast);
    padding: 0.25rem 0.625rem;
    font-size: 0.875rem;
    font-weight: 650;
  }

  .rating-chip {
    background-color: var(--warning-tint);
    border-color: oklch(from var(--warning) 0.84 calc(c * 0.34) h);
    color: oklch(from var(--warning) 0.34 calc(c * 0.95) h);
  }

  .status-chip {
    background-color: var(--success-tint);
    border-color: oklch(from var(--success) 0.84 calc(c * 0.34) h);
    color: oklch(from var(--success) 0.34 calc(c * 0.95) h);
  }

  .website-link {
    color: var(--cta-color);
  }

  #editable-fields-section {
    display: grid;
    gap: var(--padding-2);
    border: 1px solid oklch(from var(--bg-low-contrast) calc(l - 0.03) c h);
    border-radius: var(--border-radius);
    background-color: var(--bg-color);
    box-shadow: 0 0.75rem 1.75rem oklch(0.3 0.02 267 / 0.07);
  }

  .section-heading {
    align-items: flex-start;
    padding-bottom: var(--padding-1);
    border-bottom: 1px solid var(--bg-low-contrast);
  }

  .section-heading h2 {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.2;
    letter-spacing: 0;
  }

  .rating-grid {
    display: grid;
    grid-template-columns: max-content max-content;
    align-items: end;
    gap: var(--padding-1);
  }

  .field-label,
  .field-group {
    display: grid;
    gap: 0.5rem;
  }

  .field-label > span,
  .field-group-label {
    color: var(--bg-high-contrast);
    font-size: 0.875rem;
    font-weight: 650;
    line-height: 1.2;
  }

  /* ~3 digits + decimal (e.g. 4.25); size + auto width avoids stretching the grid column */
  #personal-rating {
    width: auto;
    max-inline-size: 7rem;
  }

  #is-visited-label {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    min-height: 2.75rem;
    width: fit-content;
    border: 1px solid var(--bg-low-contrast);
    border-radius: var(--border-radius);
    background-color: var(--bg-color);
    padding: 0 var(--padding-2);
    font-weight: 650;
  }

  /* Input lives inside Checkbox.svelte; scoped #is-visited would not apply. */
  :global(#is-visited) {
    --ui-control-tap-area: 1.125rem;
    --ui-control-min-block-size: 1.125rem;
    --ui-control-radius: 5px;
    inline-size: 1.125rem;
    block-size: 1.125rem;
    min-inline-size: 1.125rem;
    min-block-size: 1.125rem;
  }

  :global(#is-visited:checked::before) {
    font-size: 0.625rem;
  }

  .field-group-header {
    align-items: flex-end;
  }

  .social-link-list {
    display: grid;
    gap: var(--padding-1);
  }

  .social-link-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--padding-1);
  }

  .social-link-row > :global(svg) {
    color: var(--bg-medium-contrast);
  }

  .remove-link-button {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--error);
    border-radius: var(--border-radius);
    background-color: var(--error-tint);
    color: var(--error);
  }

  .quiet-note,
  .save-message,
  .state-panel p {
    margin: 0;
    color: var(--bg-medium-contrast);
    line-height: 1.5;
  }

  .save-message {
    border: 1px solid var(--bg-low-contrast);
    border-radius: var(--border-radius);
    padding: var(--padding-1) var(--padding-2);
    font-weight: 650;
  }

  .error-message {
    border-color: var(--error);
    background-color: var(--error-tint);
    color: oklch(from var(--error) 0.38 calc(c * 0.85) h);
  }

  .success-message {
    border-color: oklch(from var(--success) 0.82 calc(c * 0.36) h);
    background-color: var(--success-tint);
    color: oklch(from var(--success) 0.34 calc(c * 0.95) h);
  }

  .save-row {
    padding-top: var(--padding-1);
  }

  .state-panel {
    display: grid;
    gap: var(--padding-2);
    max-width: 42rem;
    margin: 0 auto;
    padding: var(--padding-2);
  }

  .state-panel h1 {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1.2;
    letter-spacing: 0;
  }

  .error-panel {
    color: var(--bg-high-contrast);
  }

  .skeleton {
    border-radius: var(--border-radius);
    background: linear-gradient(
      90deg,
      var(--bg-light),
      var(--bg-low-contrast),
      var(--bg-light)
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.3s ease-out infinite;
  }

  .photo-skeleton {
    aspect-ratio: 16/9;
  }

  .line {
    width: 60%;
    height: 1rem;
  }

  .line.wide {
    width: 82%;
    height: 1.5rem;
  }

  .block {
    width: 100%;
    height: 10rem;
  }

  @keyframes skeleton-shimmer {
    from {
      background-position: 100% 0;
    }

    to {
      background-position: -100% 0;
    }
  }

  @media (min-width: 700px) {
    .spot-shell {
      padding: var(--padding-3);
    }

    .spot-hero {
      grid-template-columns: minmax(18rem, 0.88fr) minmax(20rem, 1fr);
    }

    #photo-container {
      min-height: 24rem;
      aspect-ratio: auto;
    }

    .spot-summary {
      padding: var(--padding-3);
    }

    #spot-name {
      font-size: 2.35rem;
    }

    #editable-fields-section {
      padding: var(--padding-3);
    }

    .rating-grid {
      grid-template-columns: max-content max-content;
      gap: var(--padding-2);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #photo-container[data-loading='true'],
    .skeleton {
      animation: none;
    }
  }
</style>
