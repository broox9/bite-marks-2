<script lang="ts">
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

  $effect(() => {
    if (isOpen) {
      currentPhotoIndex = 0;
    }
  });

  function showPreviousPhoto() {
    currentPhotoIndex = Math.max(0, currentPhotoIndex - 1);
  }

  function showNextPhoto() {
    currentPhotoIndex = Math.min(photos.length - 1, currentPhotoIndex + 1);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;

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
        <h2 id="lightbox-title">{title}</h2>
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

        <span class="photo-count-eyebrow">
          {currentPhotoIndex + 1} / {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </span>

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
    background-color: oklch(from var(--bg-medium-contrast) l c h / 0.46);
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
    background-color: var(--bg-high-contrast);

    box-shadow: 0 1.5rem 4rem oklch(0.05 0.02 267 / 0.5);
  }

  .lightbox-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--padding-1);
    padding: var(--padding-1) var(--padding-2);
    color: white;
  }

  .lightbox-header h2 {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    font-size: 1rem;
    font-weight: 650;
    letter-spacing: 0;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lightbox-close {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid oklch(1 0 0 / 0.18);
    border-radius: 999px;
    background-color: oklch(1 0 0 / 0.08);
    color: white;
  }

  .lightbox-stage {
    position: relative;
    min-height: min(68svh, 42rem);
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

  .photo-count-eyebrow {
    position: absolute;
    top: var(--padding-1);
    left: var(--padding-1);
    border: 1px solid oklch(1 0 0 / 0.2);
    border-radius: 999px;
    background-color: oklch(0.16 0.02 267 / 0.74);
    color: white;
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 750;
    line-height: 1.2;
    box-shadow: 0 0.35rem 1rem oklch(0.04 0.02 267 / 0.32);
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
