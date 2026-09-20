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
    Instagram,
    Facebook,
    Twitter,
    Youtube,
  } from '@lucide/svelte';
  import { page } from '$app/state';
  import { getSpotById, updateSpot } from '$lib/adapters/primary/remote-handlers/spots.remote';
  import { invalidateAll } from '$app/navigation';
  import { getPlacePhotoUrls, MAX_PLACE_PHOTOS } from '$lib/adapters/secondary/google/google.svelte';
  import { Button, Checkbox, SubmitButton } from '$components/ui';
  import PhotoLightbox from '$components/util/PhotoLightbox.svelte';
  import { extractMetadata, type SocialPlatform } from '$lib/utils/social-platform';
  import { getPriceSymbols } from '$lib/utils/price-level';
  import { locationStore } from '$lib/adapters/primary/stores/location.store.svelte';
  import { milesBetween, formatMiles } from '$lib/utils/distance';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';
  import { MAPBOX_PUBLIC_KEY } from '$lib/constants';
  import { onMount } from 'svelte';

  const spotQuery = getSpotById({ id: page.params.id ?? '' });
  const maxPhotoWidth = 800;
  const maxPhotoHeight = 1200;

  let personalRating = $state<number | null>(null);
  let personalNotes = $state<string | null>(null);
  let isVisited = $state<boolean>(false);
  let socialLinks = $state<string[]>([]);
  let editingLinkIndex = $state<number | null>(null);
  let editingLinkValue = $state<string>('');
  let rowId = $state<string | null>(null);
  let isSaving = $state(false);
  let photoUrls = $state<string[]>([]);
  let isLightboxOpen = $state(false);
  let photoLoading = $state(false);
  let photoRequestPlaceId = $state<string | null>(null);
  let saveError = $state<string | null>(null);
  let saveMessage = $state<string | null>(null);
  const previewPhotoUrl = $derived(photoUrls[0] ?? null);

  let miniMapContainer = $state<HTMLElement>();
  let miniMap: mapboxgl.Map | undefined;
  let miniMapMarker: mapboxgl.Marker | undefined;
  let miniMapReady = $state(false);

  const mapStyleForTheme = () =>
    document.documentElement.dataset.theme === 'night'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/streets-v12';

  onMount(() => {
    miniMapReady = true;
    let currentStyle = mapStyleForTheme();
    const themeObserver = new MutationObserver(() => {
      const nextStyle = mapStyleForTheme();
      if (!miniMap || nextStyle === currentStyle) return;
      currentStyle = nextStyle;
      miniMap.setStyle(nextStyle);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      themeObserver.disconnect();
      miniMapMarker?.remove();
      miniMap?.remove();
      miniMap = undefined;
      miniMapReady = false;
    };
  });

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
    const placeId = spotQuery.current?.place_id;
    if (!placeId) {
      photoUrls = [];
      isLightboxOpen = false;
      photoRequestPlaceId = null;
      return;
    }

    if (photoRequestPlaceId === placeId) return;

    photoRequestPlaceId = placeId;
    photoLoading = true;
    photoUrls = [];
    isLightboxOpen = false;

    getPlacePhotoUrls(placeId, maxPhotoWidth, maxPhotoHeight, MAX_PLACE_PHOTOS)
      .then((urls) => {
        if (photoRequestPlaceId !== placeId) return;

        photoUrls = urls;
      })
      .finally(() => {
        if (photoRequestPlaceId === placeId) {
          photoLoading = false;
        }
      });
  });

  const distanceLabel = $derived.by(() => {
    const spot = spotQuery.current;
    if (!spot || typeof spot.lat !== 'number' || typeof spot.lng !== 'number') return null;
    return formatMiles(milesBetween(locationStore.center, { lat: spot.lat, lng: spot.lng }));
  });

  const directionsUrl = $derived.by(() => {
    const spot = spotQuery.current;
    if (!spot) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
  });

  const ratingStars = $derived.by(() => {
    const value = personalRating ?? 0;
    return [1, 2, 3, 4, 5].map((n) => Math.min(1, Math.max(0, value - (n - 1))));
  });

  $effect(() => {
    const spot = spotQuery.current;
    if (!miniMapReady || !miniMapContainer || !spot) return;

    if (!miniMap) {
      mapboxgl.accessToken = MAPBOX_PUBLIC_KEY;
      miniMap = new mapboxgl.Map({
        container: miniMapContainer,
        style: mapStyleForTheme(),
        center: [spot.lng, spot.lat],
        zoom: 14,
        interactive: false,
      });
    } else {
      miniMap.setCenter([spot.lng, spot.lat]);
    }

    miniMapMarker?.remove();
    const el = document.createElement('div');
    el.className = 'r1-pin';
    el.dataset.state = 'active';
    el.innerHTML = `<span>${spot.name}</span>`;
    miniMapMarker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([spot.lng, spot.lat])
      .addTo(miniMap);
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
    editingLinkIndex = socialLinks.length - 1;
    editingLinkValue = '';
  }

  function removeSocialLink(index: number) {
    socialLinks = socialLinks.filter((_, i) => i !== index);
    if (editingLinkIndex === index) {
      editingLinkIndex = null;
      editingLinkValue = '';
    }
  }

  function updateSocialLink(index: number, value: string) {
    socialLinks = socialLinks.map((link, i) => (i === index ? value : link));
  }

  function startEditingLink(index: number) {
    editingLinkIndex = index;
    editingLinkValue = socialLinks[index];
  }

  function saveEditingLink() {
    if (editingLinkIndex !== null) {
      updateSocialLink(editingLinkIndex, editingLinkValue);
      editingLinkIndex = null;
      editingLinkValue = '';
    }
  }

  function cancelEditingLink() {
    if (editingLinkIndex !== null) {
      if (socialLinks[editingLinkIndex] === '') {
        removeSocialLink(editingLinkIndex);
      }
      editingLinkIndex = null;
      editingLinkValue = '';
    }
  }

  function openLightbox() {
    if (!photoUrls.length) return;

    isLightboxOpen = true;
  }

  function closeLightbox() {
    isLightboxOpen = false;
  }

  function getPlatformIcon(platform: SocialPlatform) {
    switch (platform) {
      case 'instagram':
        return Instagram;
      case 'facebook':
        return Facebook;
      case 'twitter':
        return Twitter;
      case 'youtube':
        return Youtube;
      case 'yelp':
      case 'google':
        return MapPin;
      case 'website':
        return Globe;
      default:
        return Link2;
    }
  }

  function getPlatformColor(platform: SocialPlatform): string {
    switch (platform) {
      case 'instagram':
        return '#E4405F';
      case 'facebook':
        return '#1877F2';
      case 'twitter':
        return '#1DA1F2';
      case 'youtube':
        return '#FF0000';
      case 'yelp':
        return '#D32323';
      case 'google':
        return '#4285F4';
      default:
        return 'var(--sys-color-text-muted)';
    }
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
      <section class="spot-hero" aria-labelledby="spot-name">
        <div id="photo-container" data-loading={photoLoading}>
          {#if photoLoading}
            <span class="loading-photo-indicator">Loading photo</span>
          {:else if previewPhotoUrl}
            <button
              type="button"
              class="photo-preview-button"
              aria-label={`Open ${spot.name} photos`}
              onclick={openLightbox}
            >
              <img src={previewPhotoUrl} alt={spot.name} />
            </button>
          {:else}
            <MapPin size={28} />
          {/if}

          <a href="/list" class="hero-back-button" aria-label="Back to list"><ArrowLeft size={18} /></a>

          {#if photoUrls.length}
            <span class="photo-count-eyebrow">
              {photoUrls.length} {photoUrls.length === 1 ? 'photo' : 'photos'}
            </span>
          {/if}
        </div>

        <div class="hero-info-card">
          <p class="hero-eyebrow">
            {(spot.primaryType ?? spot.place_types?.[0] ?? 'Spot').replace(/_/g, ' ')}
            {#if spot.neighborhood}
              &middot; {spot.neighborhood}
            {/if}
          </p>
          <h1 id="spot-name">{spot.name}</h1>
          <p id="spot-address"><MapPin size={16} />{spot.address}</p>

          <div class="metadata-row">
            {#if spot.rating}
              <span class="pill pill-rating" aria-label={`Google rating ${spot.rating}`}>
                <Star size={12} fill="currentColor" />
                {spot.rating}
              </span>
            {/if}

            {#if isVisited}
              <span class="pill pill-visited"><CircleCheck size={12} />Visited</span>
            {/if}

            {#if distanceLabel}
              <span class="pill pill-neutral">{distanceLabel}</span>
            {/if}

            {#if getPriceSymbols(spot.price_level)}
              <span class="pill pill-neutral" aria-label={`${getPriceSymbols(spot.price_level)} price level`}>
                {getPriceSymbols(spot.price_level)}
              </span>
            {/if}

            {#if spot.websiteURI}
              <a href={spot.websiteURI} target="_blank" rel="noopener noreferrer" class="pill pill-link">
                <Globe size={12} />
                Website
                <ExternalLink size={11} />
              </a>
            {/if}
          </div>
        </div>
      </section>

      <div class="mini-map-card">
        <div class="mini-map" bind:this={miniMapContainer}></div>
        <a class="directions-pill" href={directionsUrl} target="_blank" rel="noopener noreferrer"
          >Directions ↗</a
        >
      </div>

      <section id="editable-fields-section" aria-labelledby="details-heading">
        <div class="section-heading">
          <NotebookText size={20} />
          <div>
            <h2 id="details-heading">Personal details</h2>
          </div>
        </div>

        <div class="rating-grid">
          <div class="field-label">
            <span class="eyebrow">My rating</span>
            <div class="rating-editor">
              <div class="rating-stars" aria-hidden="true">
                {#each ratingStars as fill}
                  <span class="rating-star" style:--fill={fill}
                    ><Star size={16} /><Star size={16} class="rating-star-fill" /></span
                  >
                {/each}
              </div>
              <input
                id="personal-rating"
                class="ui-input rating-input"
                type="number"
                min="0"
                max="5"
                step="0.25"
                size="5"
                bind:value={personalRating}
                placeholder="0–5"
                aria-label="My rating, 0 to 5"
              />
            </div>
          </div>

          <label for="is-visited" id="is-visited-label" class:on={isVisited}>
            <Checkbox
              id="is-visited"
              name="is-visited"
              checked={isVisited}
              onchange={(event: Event) => {
                const target = event.currentTarget as HTMLInputElement;
                isVisited = target.checked;
              }}
            />
            <CircleCheck size={14} />
            <span>Visited</span>
          </label>
        </div>

        <label for="personal-notes" class="field-label">
          <span class="eyebrow">Notes</span>
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
            <span id="social-links-label" class="eyebrow">Links</span>
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
                {#if editingLinkIndex === index}
                  <div class="social-link-row editing">
                    <Link2 size={18} />
                    <input
                      type="url"
                      bind:value={editingLinkValue}
                      class="ui-input"
                      aria-label={`Edit social link ${index + 1}`}
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      class="save-edit-button"
                      aria-label="Save link"
                      onclick={saveEditingLink}
                    >
                      <CircleCheck size={17} />
                    </button>
                    <button
                      type="button"
                      class="cancel-edit-button"
                      aria-label="Cancel"
                      onclick={cancelEditingLink}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                {:else}
                  {@const metadata = extractMetadata(link)}
                  {@const IconComponent = getPlatformIcon(metadata.platform)}
                  {@const iconColor = getPlatformColor(metadata.platform)}
                  <div class="social-link-row">
                    <button
                      type="button"
                      class="platform-icon-button"
                      style:--icon-color={iconColor}
                      onclick={() => startEditingLink(index)}
                      aria-label={`Edit ${metadata.platform} link`}
                    >
                      <IconComponent size={20} />
                    </button>
                    <div class="link-metadata">
                      <span class="platform-name">{metadata.platform}</span>
                      <span class="link-display-text">{metadata.displayText}</span>
                    </div>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="link-out-button"
                      aria-label={`Open ${metadata.platform} link`}
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      type="button"
                      class="remove-link-button"
                      aria-label={`Remove ${metadata.platform} link`}
                      onclick={() => removeSocialLink(index)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                {/if}
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

    <PhotoLightbox
      photos={photoUrls}
      title={spot.name}
      isOpen={isLightboxOpen}
      onClose={closeLightbox}
    />
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
    color: var(--sys-color-text);
  }

  .spot-shell {
    display: grid;
    gap: var(--padding-2);
    width: 100%;
    max-width: 62rem;
    margin: 0 auto;
    padding: 0 var(--padding-2) var(--padding-3);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    width: fit-content;
    min-height: 2.5rem;
    color: var(--sys-color-text);
    font-weight: 650;
  }

  .back-link:hover {
    color: var(--sys-color-brand);
  }

  :is(
      .back-link,
      .pill-link,
      .photo-preview-button,
      .remove-link-button,
      .platform-icon-button,
      .save-edit-button,
      .cancel-edit-button,
      .hero-back-button,
      .directions-pill
    ):focus-visible {
    outline: none;
    box-shadow: var(--comp-focus-ring);
  }

  .spot-hero {
    position: relative;
    min-width: 0;
  }

  #photo-container {
    width: 100%;
    aspect-ratio: 16/10;
    max-height: 22rem;
    display: grid;
    place-items: center;
    background-color: var(--sys-color-surface-sunken);
    color: var(--sys-color-text-muted);
    overflow: hidden;
    position: relative;
    border-radius: var(--comp-card-radius);
  }

  #photo-container[data-loading='true'] {
    background: linear-gradient(
      90deg,
      var(--sys-color-surface-raised),
      var(--sys-color-surface-sunken),
      var(--sys-color-surface-raised)
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.3s ease-out infinite;
  }

  #photo-container .loading-photo-indicator {
    border: 1px solid var(--sys-color-border);
    border-radius: 999px;
    background-color: var(--sys-color-surface-raised);
    padding: 0.375rem 0.75rem;
    color: var(--sys-color-text-muted);
    font-size: 0.875rem;
    font-weight: 650;
  }

  .photo-preview-button {
    inline-size: 100%;
    block-size: 100%;
    display: block;
    border: 0;
    background: transparent;
    padding: 0;
    position: relative;
    cursor: zoom-in;
  }

  .photo-preview-button img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .hero-back-button {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    width: 2.25rem;
    height: 2.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-surface);
    color: var(--sys-color-text);
    box-shadow: var(--ref-shadow-sm);
  }

  .photo-count-eyebrow {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    border: none;
    border-radius: 999px;
    background-color: oklch(from black 0.15 0.02 267 / 0.55);
    color: var(--sys-color-text-on-dark);
    padding: 0.3125rem 0.625rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .hero-info-card {
    /* Overlap the photo without clipping the card or guessing its content height. */
    position: relative;
    margin: -3rem 1.125rem 0;
    overflow-wrap: anywhere;
    background-color: var(--comp-card-bg);
    border: 1px solid var(--comp-card-border);
    border-radius: var(--comp-card-radius);
    box-shadow: var(--comp-card-shadow);
    padding: 0.875rem;
  }

  .hero-eyebrow {
    margin: 0 0 0.25rem;
    color: var(--comp-eyebrow-text);
    font-size: var(--comp-eyebrow-size);
    font-weight: var(--comp-eyebrow-weight);
    letter-spacing: var(--comp-eyebrow-spacing);
    text-transform: uppercase;
    font-family: var(--sys-font-mono);
  }

  #spot-name {
    text-wrap: pretty;
    margin: 0;
    color: var(--sys-color-text);
    font-size: 1.5rem;
    font-family: var(--sys-font-display);
    font-weight: var(--sys-display-weight);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  #spot-address {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    max-width: 58ch;
    margin: 0.375rem 0 0;
    color: var(--sys-color-text-muted);
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  #spot-address :global(svg) {
    flex: 0 0 auto;
    margin-top: 0.1rem;
  }

  .metadata-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.625rem;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3125rem;
    border-radius: 999px;
    padding: 0.25rem 0.5625rem;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .pill-rating {
    background-color: var(--comp-chip-rating-bg);
    border: 1px solid var(--comp-chip-rating-border);
    color: var(--comp-chip-rating-text);
  }

  .pill-rating :global(svg) {
    color: var(--comp-chip-rating-icon);
  }

  .pill-visited {
    background-color: var(--comp-chip-visited-bg);
    border: 1px solid var(--comp-chip-visited-border);
    color: var(--comp-chip-visited-text);
  }

  .pill-neutral {
    background-color: var(--sys-color-surface-sunken);
    color: var(--sys-color-text-muted);
  }

  .pill-link {
    background-color: var(--sys-color-surface);
    border: 1px solid var(--sys-color-border);
    color: var(--sys-color-brand);
  }

  .mini-map-card {
    position: relative;
    height: 8.75rem;
    border-radius: var(--sys-radius-control);
    overflow: hidden;
    border: 1px solid var(--sys-color-border);
  }

  .mini-map {
    position: absolute;
    inset: 0;
  }

  .directions-pill {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    background-color: var(--sys-color-surface);
    color: var(--sys-color-brand);
    border-radius: var(--sys-radius-control);
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 700;
    box-shadow: var(--ref-shadow-sm);
    z-index: 1;
  }

  #editable-fields-section {
    display: grid;
    gap: var(--padding-2);
    border: 1px solid var(--comp-card-border);
    border-radius: var(--comp-card-radius);
    background-color: var(--comp-card-bg);
    box-shadow: var(--comp-card-shadow);
    padding: var(--padding-2);
  }

  .section-heading {
    display: flex;
    align-items: flex-start;
    gap: var(--padding-1);
    padding-bottom: var(--padding-1);
    border-bottom: 1px solid var(--sys-color-border);
  }

  .section-heading h2 {
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.2;
    letter-spacing: 0;
  }

  .rating-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: var(--padding-1);
  }

  .field-label,
  .field-group {
    display: grid;
    gap: 0.5rem;
  }

  .eyebrow {
    color: var(--comp-section-label-text);
    font-size: var(--comp-section-label-size);
    font-weight: var(--comp-section-label-weight);
    letter-spacing: var(--comp-section-label-spacing);
    text-transform: uppercase;
    font-family: var(--sys-font-mono);
  }

  .rating-editor {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .rating-stars {
    display: flex;
    gap: 0.125rem;
    color: var(--sys-color-border-strong);
  }

  .rating-star {
    position: relative;
    display: inline-flex;
  }

  .rating-star :global(.rating-star-fill) {
    position: absolute;
    inset: 0;
    color: var(--sys-color-warning);
    clip-path: inset(0 calc(100% * (1 - var(--fill))) 0 0);
  }

  #personal-rating {
    width: auto;
    max-inline-size: 6rem;
  }

  #is-visited-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.5rem;
    width: fit-content;
    border: 1px solid var(--comp-chip-visited-border);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-surface);
    color: var(--sys-color-text-muted);
    padding: 0 0.75rem;
    font-weight: 700;
    font-size: 0.8125rem;
  }

  #is-visited-label.on {
    background-color: var(--comp-chip-visited-bg);
    color: var(--comp-chip-visited-text);
  }

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
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .social-link-list {
    display: grid;
    gap: var(--padding-1);
  }

  .social-link-row {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: var(--padding-1);
    min-height: 3.5rem;
    padding: var(--padding-1) var(--padding-2);
    border: 1px solid var(--comp-link-card-border);
    border-radius: var(--comp-link-card-radius);
    background-color: var(--comp-link-card-bg);
    transition: border-color 0.15s ease;
  }

  .social-link-row.editing {
    border-color: var(--sys-color-accent);
  }

  .platform-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-surface-sunken);
    color: var(--icon-color);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .platform-icon-button:hover {
    background-color: var(--sys-color-surface-raised);
    border-color: var(--icon-color);
  }

  .link-metadata {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .platform-name {
    font-size: 0.6875rem;
    font-weight: 650;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--comp-link-card-label-text);
  }

  .link-display-text {
    font-size: 0.9375rem;
    font-weight: 550;
    color: var(--comp-link-card-value-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .link-out-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-surface);
    color: var(--sys-color-brand);
    transition: all 0.15s ease;
  }

  .link-out-button:hover {
    background-color: var(--sys-color-surface-raised);
    border-color: var(--sys-color-brand);
  }

  .save-edit-button {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--sys-color-success);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-success-tint);
    color: var(--sys-color-success);
    transition: all 0.15s ease;
  }

  .save-edit-button:hover {
    background-color: oklch(from var(--sys-color-success-tint) calc(l - 0.02) c h);
  }

  .cancel-edit-button {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-surface);
    color: var(--sys-color-text-muted);
    transition: all 0.15s ease;
  }

  .cancel-edit-button:hover {
    border-color: var(--sys-color-text-muted);
    color: var(--sys-color-text);
  }

  .remove-link-button {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--sys-color-error);
    border-radius: var(--sys-radius-control);
    background-color: var(--sys-color-error-tint);
    color: var(--sys-color-error);
  }

  .quiet-note,
  .save-message,
  .state-panel p {
    margin: 0;
    color: var(--sys-color-text-muted);
    line-height: 1.5;
  }

  .save-message {
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-control);
    padding: var(--padding-1) var(--padding-2);
    font-weight: 650;
  }

  .error-message {
    border-color: var(--sys-color-error);
    background-color: var(--sys-color-error-tint);
    color: var(--sys-color-error-text);
  }

  .success-message {
    border-color: var(--sys-color-success-border);
    background-color: var(--sys-color-success-tint);
    color: var(--sys-color-success-text);
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

  .skeleton {
    border-radius: var(--sys-radius-control);
    background: linear-gradient(
      90deg,
      var(--sys-color-surface-raised),
      var(--sys-color-surface-sunken),
      var(--sys-color-surface-raised)
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

    #spot-name {
      font-size: 2rem;
    }

    #editable-fields-section {
      padding: var(--padding-3);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #photo-container[data-loading='true'],
    .skeleton {
      animation: none;
    }
  }
</style>
