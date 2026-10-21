<script lang="ts">
  import type { PageData } from "./$types";
  import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ExternalLink,
    Globe,
    LogIn,
    MapPin,
    Share2,
    Star,
    UserPlus,
  } from "@lucide/svelte";
  import { onMount } from "svelte";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";

  import { Button } from "$components/ui";
  import PhotoLightbox from "$components/util/PhotoLightbox.svelte";
  import { saveSpot } from "$lib/adapters/primary/remote-handlers/spots.remote";
  import {
    getPlacePhotoUrls,
    MAX_PLACE_PHOTOS,
  } from "$lib/adapters/secondary/google/google.svelte";
  import { MAPBOX_PUBLIC_KEY } from "$lib/constants";
  import type { MasterPlaceRecord } from "$lib/core/domain/Place/Place";
  import { getPriceSymbols } from "$lib/utils/price-level";

  let { data }: { data: PageData } = $props();

  const place = $derived(data.place as MasterPlaceRecord);
  const publicPath = $derived(`/p/${encodeURIComponent(place.place_id)}`);
  const signInHref = $derived(`/login?redirectTo=${encodeURIComponent(publicPath)}`);
  const signUpHref = $derived(
    `/login?mode=register&redirectTo=${encodeURIComponent(publicPath)}`,
  );
  const typeLabels = $derived(
    [...new Set(place.place_types ?? [])]
      .filter((type: string) => !["food", "point of interest", "establishment"].includes(type))
      .slice(0, 4),
  );
  const locationLabel = $derived(
    [...new Set([place.neighborhood, ...(place.areas ?? [])].filter(Boolean))].join(" · "),
  );
  const directionsUrl = $derived(
    `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`,
  );

  let photoUrls = $state<string[]>([]);
  let photoLoading = $state(true);
  let isLightboxOpen = $state(false);
  let shareMessage = $state("");
  let isSaved = $state(false);
  let savePending = $state(false);
  let saveError = $state("");
  let miniMapContainer = $state<HTMLElement>();
  let miniMap: mapboxgl.Map | undefined;
  let miniMapMarker: mapboxgl.Marker | undefined;
  let miniMapReady = $state(false);

  $effect.pre(() => {
    if (data.isSaved) isSaved = true;
  });

  const mapStyleForTheme = () =>
    document.documentElement.dataset.theme === "night"
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";

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
      attributeFilter: ["data-theme"],
    });

    return () => {
      themeObserver.disconnect();
      miniMapMarker?.remove();
      miniMap?.remove();
      miniMap = undefined;
      miniMapReady = false;
    };
  });

  $effect(() => {
    const placeId = place.place_id;
    photoLoading = true;
    photoUrls = [];
    getPlacePhotoUrls(placeId, 1200, 1600, MAX_PLACE_PHOTOS)
      .then((urls) => {
        photoUrls = urls;
      })
      .finally(() => {
        photoLoading = false;
      });
  });

  $effect(() => {
    if (!miniMapReady || !miniMapContainer) return;

    if (!miniMap) {
      mapboxgl.accessToken = MAPBOX_PUBLIC_KEY;
      miniMap = new mapboxgl.Map({
        container: miniMapContainer,
        style: mapStyleForTheme(),
        center: [place.lng, place.lat],
        zoom: 14,
        interactive: false,
      });
    } else {
      miniMap.setCenter([place.lng, place.lat]);
    }

    miniMapMarker?.remove();
    const marker = document.createElement("div");
    marker.className = "r1-pin";
    marker.dataset.state = "active";
    marker.innerHTML = `<span>${place.name}</span>`;
    miniMapMarker = new mapboxgl.Marker({ element: marker, anchor: "bottom" })
      .setLngLat([place.lng, place.lat])
      .addTo(miniMap);
  });

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(data.canonicalUrl);
    } catch {
      const input = document.createElement("textarea");
      input.value = data.canonicalUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    shareMessage = "Link copied";
  }

  async function handleShare() {
    shareMessage = "";
    const useNativeShare =
      typeof navigator.share === "function" &&
      window.matchMedia("(pointer: coarse)").matches;

    if (useNativeShare) {
      try {
        await navigator.share({
          title: `${place.name} · Bite Marks`,
          text: `Check out ${place.name}${place.address ? ` — ${place.address}` : ""}`,
          url: data.canonicalUrl,
        });
        shareMessage = "Shared";
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await copyShareLink();
  }

  async function handleSave() {
    savePending = true;
    saveError = "";
    try {
      const result = await saveSpot({
        spot: {
          place_id: place.place_id,
          name: place.name,
          address: place.address,
          rating: place.rating,
          websiteURI: place.websiteURI,
          price_level: place.price_level,
          lat: place.lat,
          lng: place.lng,
          photos: Array.isArray(place.photos) ? place.photos : [],
          neighborhood: place.neighborhood,
          areas: place.areas,
          place_types: place.place_types,
          primaryType: place.primaryType,
        },
      });
      if ("success" in result && !result.success) {
        throw new Error(result.error || "Could not save this spot.");
      }
      isSaved = true;
    } catch (error) {
      saveError = error instanceof Error ? error.message : "Could not save this spot.";
    } finally {
      savePending = false;
    }
  }
</script>

<svelte:head>
  <title>{place.name} · Bite Marks</title>
  <meta
    name="description"
    content={`${place.name}${place.address ? ` — ${place.address}` : ""}. Shared from Bite Marks.`}
  />
  <link rel="canonical" href={data.canonicalUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Bite Marks" />
  <meta property="og:title" content={`${place.name} · Bite Marks`} />
  <meta property="og:description" content={place.address} />
  <meta property="og:url" content={data.canonicalUrl} />
  <meta property="og:image" content={data.ogImage} />
  <meta property="og:image:alt" content={place.name} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${place.name} · Bite Marks`} />
  <meta name="twitter:description" content={place.address} />
  <meta name="twitter:image" content={data.ogImage} />
</svelte:head>

<main class="public-spot-page">
  <article class="spot-shell">
    <a href="/all-spots" class="catalog-link"><ArrowLeft size={16} />All spots</a>

    <section class="spot-hero" aria-labelledby="spot-name">
      <div id="photo-container" data-loading={photoLoading}>
        {#if photoLoading}
          <span class="loading-photo-indicator">Finding photos</span>
        {:else if photoUrls[0]}
          <button
            type="button"
            class="photo-preview-button"
            aria-label={`Open ${place.name} photos`}
            onclick={() => (isLightboxOpen = true)}
          >
            <img src={photoUrls[0]} alt={place.name} />
          </button>
        {:else}
          <div class="photo-fallback">
            <MapPin size={30} />
            <span>{locationLabel || "Saved in the Bite Marks catalog"}</span>
          </div>
        {/if}

        <button type="button" class="hero-share-button" onclick={handleShare}>
          {#if shareMessage}
            <Check size={16} />{shareMessage}
          {:else}
            <Share2 size={16} />Share
          {/if}
        </button>

        {#if photoUrls.length}
          <span class="photo-count">
            {photoUrls.length} {photoUrls.length === 1 ? "photo" : "photos"}
          </span>
        {/if}
      </div>

      <div class="hero-info-card">
        <p class="hero-eyebrow">
          {(place.primaryType ?? place.place_types?.[0] ?? "Spot").replace(/_/g, " ")}
          {#if place.neighborhood}&middot; {place.neighborhood}{/if}
        </p>
        <h1 id="spot-name">{place.name}</h1>
        <p id="spot-address"><MapPin size={16} />{place.address}</p>

        <div class="metadata-row">
          {#if place.rating}
            <span class="pill pill-rating" aria-label={`Google rating ${place.rating}`}>
              <Star size={12} fill="currentColor" />{place.rating}
            </span>
          {/if}
          {#if getPriceSymbols(place.price_level)}
            <span class="pill pill-neutral">{getPriceSymbols(place.price_level)}</span>
          {/if}
          {#if place.websiteURI}
            <a
              href={place.websiteURI}
              target="_blank"
              rel="noopener noreferrer"
              class="pill pill-link"
            >
              <Globe size={12} />Website<ExternalLink size={11} />
            </a>
          {/if}
        </div>
      </div>
    </section>

    <div class="content-grid">
      <section class="place-details" aria-labelledby="about-heading">
        <div>
          <p class="section-kicker">The place</p>
          <h2 id="about-heading">Worth knowing</h2>
        </div>

        {#if locationLabel}
          <div class="detail-row">
            <span>Neighborhood</span>
            <strong>{locationLabel}</strong>
          </div>
        {/if}

        {#if typeLabels.length}
          <div class="type-list" aria-label="Place types">
            {#each typeLabels as type}
              <span>{type.replace(/_/g, " ")}</span>
            {/each}
          </div>
        {/if}
      </section>

      <section class="action-card" aria-labelledby="action-heading">
        {#if data.user}
          {#if isSaved}
            <div class="saved-state" role="status">
              <CheckCircle2 size={24} />
              <div>
                <h2 id="action-heading">Saved to your spots</h2>
                <p>You’ll find it waiting in your personal list.</p>
              </div>
            </div>
            <a class="secondary-action" href="/list">View my spots</a>
          {:else}
            <div>
              <p class="section-kicker">Keep this one</p>
              <h2 id="action-heading">Save it for later</h2>
              <p>Add this place to your own Bite Marks list.</p>
            </div>
            <Button
              data-width="full"
              onclick={handleSave}
              disabled={savePending}
            >
              {savePending ? "Saving…" : "Save to my spots"}
            </Button>
            {#if saveError}<p class="action-error" role="alert">{saveError}</p>{/if}
          {/if}
        {:else}
          <div>
            <p class="section-kicker">Make it yours</p>
            <h2 id="action-heading">Remember every good spot.</h2>
            <p>Create a Bite Marks account to save this place, or sign in to add it to your list.</p>
          </div>
          <div class="auth-actions">
            <a class="primary-action" href={signUpHref}><UserPlus size={17} />Create account</a>
            <a class="secondary-action" href={signInHref}><LogIn size={17} />Sign in</a>
          </div>
        {/if}
      </section>
    </div>

    <div class="mini-map-card">
      <div class="mini-map" bind:this={miniMapContainer}></div>
      <a class="directions-pill" href={directionsUrl} target="_blank" rel="noopener noreferrer">
        Directions <ExternalLink size={12} />
      </a>
    </div>

    <section class="share-footer" aria-label="Share this spot">
      <div>
        <p class="section-kicker">Pass it on</p>
        <p>Know someone who’d like this place?</p>
      </div>
      <Button data-variant="ghost" onclick={handleShare}>
        {#if shareMessage}<Check size={16} />{shareMessage}{:else}<Share2 size={16} />Share spot{/if}
      </Button>
    </section>
  </article>
</main>

<PhotoLightbox
  photos={photoUrls}
  title={place.name}
  isOpen={isLightboxOpen}
  onClose={() => (isLightboxOpen = false)}
/>

<style>
  .public-spot-page {
    min-height: calc(100svh - 4rem);
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

  .catalog-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    width: fit-content;
    min-height: 2.75rem;
    color: var(--sys-color-text-muted);
    font-size: 0.8125rem;
    font-weight: 700;
  }

  .catalog-link:hover {
    color: var(--sys-color-brand);
  }

  .spot-hero {
    position: relative;
    min-width: 0;
  }

  #photo-container {
    position: relative;
    display: grid;
    width: 100%;
    max-height: 24rem;
    aspect-ratio: 16 / 10;
    place-items: center;
    overflow: hidden;
    border-radius: var(--comp-card-radius);
    background:
      radial-gradient(circle at 20% 15%, var(--sys-color-brand-tint), transparent 38%),
      var(--sys-color-surface-sunken);
    color: var(--sys-color-text-muted);
  }

  #photo-container[data-loading="true"] {
    background: linear-gradient(
      90deg,
      var(--sys-color-surface-raised),
      var(--sys-color-surface-sunken),
      var(--sys-color-surface-raised)
    );
    background-size: 200% 100%;
    animation: shimmer 1.3s ease-out infinite;
  }

  .loading-photo-indicator {
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-pill);
    padding: 0.4rem 0.75rem;
    background: var(--sys-color-surface-raised);
    font-size: 0.8125rem;
    font-weight: 700;
  }

  .photo-preview-button {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    padding: 0;
    background: transparent;
    cursor: zoom-in;
  }

  .photo-preview-button img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo-fallback {
    display: grid;
    justify-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    font-size: 0.8125rem;
    font-weight: 650;
    text-align: center;
  }

  .hero-share-button,
  .photo-count {
    position: absolute;
    top: 0.75rem;
    border: 0;
    border-radius: var(--sys-radius-pill);
    box-shadow: var(--ref-shadow-sm);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .hero-share-button {
    right: 0.75rem;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 2.25rem;
    padding: 0.4rem 0.7rem;
    background: var(--sys-color-surface);
    color: var(--sys-color-text);
    cursor: pointer;
  }

  .photo-count {
    left: 0.75rem;
    padding: 0.4rem 0.65rem;
    background: oklch(0.18 0.02 260 / 0.72);
    color: var(--sys-color-text-on-dark);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .hero-info-card {
    position: relative;
    margin: -3rem 1.125rem 0;
    overflow-wrap: anywhere;
    border: 1px solid var(--comp-card-border);
    border-radius: var(--comp-card-radius);
    padding: 0.875rem;
    background: var(--comp-card-bg);
    box-shadow: var(--comp-card-shadow);
  }

  .hero-eyebrow,
  .section-kicker {
    margin: 0;
    color: var(--comp-eyebrow-text);
    font-family: var(--sys-font-mono);
    font-size: var(--comp-eyebrow-size);
    font-weight: var(--comp-eyebrow-weight);
    letter-spacing: var(--comp-eyebrow-spacing);
    text-transform: uppercase;
  }

  #spot-name {
    margin: 0.25rem 0 0;
    font-family: var(--sys-font-display);
    font-size: clamp(1.65rem, 6vw, 2.35rem);
    font-weight: var(--sys-display-weight);
    line-height: 1.05;
    letter-spacing: var(--sys-display-tracking);
    text-wrap: pretty;
  }

  #spot-address {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    max-width: 58ch;
    margin: 0.5rem 0 0;
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
    gap: 0.375rem;
    margin-top: 0.75rem;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    border-radius: var(--sys-radius-pill);
    padding: 0.25rem 0.55rem;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .pill-rating {
    border: 1px solid var(--comp-chip-rating-border);
    background: var(--comp-chip-rating-bg);
    color: var(--comp-chip-rating-text);
  }

  .pill-neutral {
    background: var(--sys-color-surface-sunken);
    color: var(--sys-color-text-muted);
  }

  .pill-link {
    border: 1px solid var(--sys-color-border);
    background: var(--sys-color-surface);
    color: var(--sys-color-brand);
  }

  .content-grid {
    display: grid;
    gap: var(--padding-2);
  }

  .place-details,
  .action-card,
  .share-footer {
    border: 1px solid var(--comp-card-border);
    border-radius: var(--comp-card-radius);
    padding: var(--padding-2);
    background: var(--comp-card-bg);
    box-shadow: var(--comp-card-shadow);
  }

  .place-details,
  .action-card {
    display: grid;
    align-content: start;
    gap: 1rem;
  }

  h2 {
    margin: 0.25rem 0 0;
    font-family: var(--sys-font-display);
    font-size: 1.35rem;
    line-height: 1.15;
  }

  .action-card p:not(.section-kicker),
  .saved-state p {
    margin: 0.4rem 0 0;
    color: var(--sys-color-text-muted);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .detail-row {
    display: grid;
    gap: 0.25rem;
    padding-top: 0.875rem;
    border-top: 1px solid var(--sys-color-border);
  }

  .detail-row span {
    color: var(--sys-color-text-muted);
    font-family: var(--sys-font-mono);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .detail-row strong {
    font-size: 0.875rem;
  }

  .type-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .type-list span {
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-pill);
    padding: 0.3rem 0.6rem;
    color: var(--sys-color-text-secondary);
    font-size: 0.75rem;
    text-transform: capitalize;
  }

  .auth-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
  }

  .primary-action,
  .secondary-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 2.75rem;
    border-radius: var(--sys-radius-control);
    padding: 0.55rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 700;
    text-align: center;
  }

  .primary-action {
    border: 1px solid var(--comp-btn-primary-border);
    background: var(--comp-btn-primary-bg);
    color: var(--comp-btn-primary-text);
  }

  .secondary-action {
    border: 1px solid var(--sys-color-border);
    background: var(--sys-color-surface);
    color: var(--sys-color-text);
  }

  .saved-state {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    color: var(--sys-color-success);
  }

  .saved-state :global(svg) {
    flex: 0 0 auto;
  }

  .saved-state h2 {
    margin: 0;
    color: var(--sys-color-text);
  }

  .action-error {
    color: var(--sys-color-error-text) !important;
  }

  .mini-map-card {
    position: relative;
    height: 11rem;
    overflow: hidden;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--comp-card-radius);
  }

  .mini-map {
    position: absolute;
    inset: 0;
  }

  .directions-pill {
    position: absolute;
    top: 0.625rem;
    right: 0.625rem;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    border-radius: var(--sys-radius-control);
    padding: 0.4rem 0.65rem;
    background: var(--sys-color-surface);
    box-shadow: var(--ref-shadow-sm);
    color: var(--sys-color-brand);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .share-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .share-footer p:last-child {
    margin: 0.25rem 0 0;
    color: var(--sys-color-text-muted);
    font-size: 0.8125rem;
  }

  :is(
    .catalog-link,
    .photo-preview-button,
    .hero-share-button,
    .pill-link,
    .primary-action,
    .secondary-action,
    .directions-pill
  ):focus-visible {
    outline: none;
    box-shadow: var(--comp-focus-ring);
  }

  @keyframes shimmer {
    from { background-position: 200% 0; }
    to { background-position: -200% 0; }
  }

  @media (min-width: 48rem) {
    .spot-shell {
      padding-inline: var(--padding-3);
    }

    .content-grid {
      grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.9fr);
    }

    .hero-info-card {
      margin-inline: 2rem;
      padding: 1.25rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #photo-container[data-loading="true"] {
      animation: none;
    }
  }
</style>
