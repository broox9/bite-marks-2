<script lang="ts">
  import { browser } from '$app/environment';
  import { ChevronLeft, ChevronRight, X } from '@lucide/svelte';

  let {
    photos = [],
    title = '',
    isOpen = false,
    onClose,
  }: {
    photos?: string[];
    title?: string;
    isOpen?: boolean;
    onClose: () => void;
  } = $props();

  let currentPhotoIndex = $state(0);
  const currentPhotoUrl = $derived(photos[currentPhotoIndex] ?? null);
  const isLightboxVisible = $derived(isOpen && currentPhotoUrl !== null);

  $effect(() => {
    if (isOpen) {
      currentPhotoIndex = 0;
    }
  });

  $effect(() => {
    if (!browser || !isLightboxVisible) return;

    const scrollY = window.scrollY;
    const bodyStyle = document.body.style;
    const rootStyle = document.documentElement.style;
    const previousBodyOverflow = bodyStyle.overflow;
    const previousBodyPosition = bodyStyle.position;
    const previousBodyTop = bodyStyle.top;
    const previousBodyLeft = bodyStyle.left;
    const previousBodyRight = bodyStyle.right;
    const previousBodyWidth = bodyStyle.width;
    const previousRootOverflow = rootStyle.overflow;

    rootStyle.overflow = 'hidden';
    bodyStyle.overflow = 'hidden';
    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.left = '0';
    bodyStyle.right = '0';
    bodyStyle.width = '100%';

    return () => {
      rootStyle.overflow = previousRootOverflow;
      bodyStyle.overflow = previousBodyOverflow;
      bodyStyle.position = previousBodyPosition;
      bodyStyle.top = previousBodyTop;
      bodyStyle.left = previousBodyLeft;
      bodyStyle.right = previousBodyRight;
      bodyStyle.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  });

  function showPreviousPhoto() {
    currentPhotoIndex = Math.max(0, currentPhotoIndex - 1);
  }

  function showNextPhoto() {
    currentPhotoIndex = Math.min(photos.length - 1, currentPhotoIndex + 1);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isLightboxVisible) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPreviousPhoto();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNextPhoto();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && currentPhotoUrl}
  <div class="lightbox-backdrop">
    <button
      type="button"
      class="lightbox-scrim"
      aria-label="Close photos"
      onclick={onClose}
    ></button>
    <div
      class="lightbox-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      tabindex="-1"
    >
      <div class="lightbox-header">
        <div class="lightbox-header-title">
          <!-- <span class="photo-count-eyebrow">
            {currentPhotoIndex + 1} / {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </span> -->
          <small>
            {currentPhotoIndex + 1} / {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </small>
          <h2 id="lightbox-title">{title}</h2>
        </div>

        <button
          type="button"
          class="lightbox-close"
          aria-label="Close photos"
          onclick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div class="lightbox-stage">
        <img
          src={currentPhotoUrl}
          alt={`${title} photo ${currentPhotoIndex + 1} of ${photos.length}`}
        />

        {#if currentPhotoIndex > 0}
          <button
            type="button"
            class="carousel-button previous"
            aria-label="Previous photo"
            onclick={showPreviousPhoto}
          >
            <ChevronLeft size={22} />
          </button>
        {/if}

        {#if currentPhotoIndex < photos.length - 1}
          <button
            type="button"
            class="carousel-button next"
            aria-label="Next photo"
            onclick={showNextPhoto}
          >
            <ChevronRight size={22} />
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .lightbox-scrim:focus-visible,
  .lightbox-close:focus-visible,
  .carousel-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px oklch(from var(--accent-color) l c h / 0.26);
  }

  .lightbox-backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: var(--padding-2);
    background-color: oklch(from var(--cta-primary-tint-1) l c h / 0.46);
    backdrop-filter: blur(3px) grayscale(1);
  }

  .lightbox-scrim {
    position: absolute;
    inset: 0;
    border: 0;
    background-color: transparent;
  }

  .lightbox-dialog {
    position: relative;
    z-index: 1;
    width: min(68rem, 100%);
    max-height: min(52rem, calc(100svh - (var(--padding-2) * 2)));
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    overflow: hidden;
    border: 1px solid oklch(from var(--bg-color) l c h / 0.2);
    border-radius: var(--border-radius);
    background-color: oklch(from var(--bg-light) l c h / 0.8);
    backdrop-filter: blur(3px);
    box-shadow: 0 1.5rem 4rem oklch(0.05 0.02 267 / 0.5);
  }

  .lightbox-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--padding-1);
    padding: var(--padding-1) var(--padding-2);
    color: var(--text-color);
  }

  .lightbox-header h2 {
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 0;
    margin: 0;
    overflow: hidden;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 1.25;
  }

  .lightbox-header-title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--padding-1);
    padding-bottom: 1rem;

    & > small {
      font-size: 0.75rem;
      font-weight: 300;
    }
  }

  .lightbox-close {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--bg-low-contrast);
    border-radius: 999px;
    background-color: var(--bg-light);
    color: var(--bg-medium-contrast);
  }

  .lightbox-stage {
    position: relative;
    /*min-height: min(68svh, 42rem);*/
    min-height: 200px;
    display: grid;
    place-items: center;
    /*background-color: oklch(0.11 0.02 267);*/
  }

  .lightbox-stage img {
    width: 100%;
    height: 100%;
    max-height: min(72svh, 46rem);
    display: block;
    object-fit: contain;
  }

  .carousel-button {
    position: absolute;
    top: 50%;
    inline-size: 2.5rem;
    block-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid oklch(from var(--bg-color) l c h / 0.48);
    border-radius: 999px;
    background-color: oklch(from var(--bg-color) l c h / 0.32);
    color: var(--bg-high-contrast);
    box-shadow: 0 0.5rem 1.25rem oklch(0.24 0.02 267 / 0.18);
    transform: translateY(-50%);
    transition:
      background-color 0.18s ease,
      transform 0.18s ease;
  }

  .carousel-button:hover {
    background-color: oklch(from var(--bg-color) l c h / 0.52);
    transform: translateY(-50%) scale(1.04);
  }

  .carousel-button.previous {
    left: var(--padding-1);
  }

  .carousel-button.next {
    right: var(--padding-1);
  }
</style>
