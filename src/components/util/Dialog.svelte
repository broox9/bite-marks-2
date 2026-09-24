<script lang="ts">
  import Card from "./Card.svelte";
  import { Button} from '../ui'


  let modal: HTMLDialogElement

  const { children, title = '', shouldModalBeOpen = false, onClose } = $props()

  $effect(() => {
    if (shouldModalBeOpen) {
      modal.showModal()
    } else {
      modal.close()
    }
  })
</script>

<!-- <div id="dialog-backdrop"></div> -->
<dialog bind:this={modal} id="dialog-box" aria-label={title || undefined} oncancel={onClose}>
  <button id="close-button" type='button' onclick={onClose} aria-label="Close">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </button>
  <div>
    {@render children()}
  </div>
</dialog>


<style>
  #dialog-box {
    position: relative;
    place-self: center;
    max-height: calc(100dvh - 2rem);
    overflow-y: auto;
    border: 1px solid var(--sys-color-border);
    border-radius: var(--sys-radius-2xl);
    padding: 0;
    width: min(32rem, calc(100vw - 2rem));
    background: var(--sys-color-surface);
    color: var(--sys-color-text);
    box-shadow: 0 1.5rem 4rem oklch(0.05 0.01 70 / 0.35);
    z-index: 10;
  }

  #close-button {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 2.25rem;
    height: 2.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: var(--sys-color-surface);
    color: var(--sys-color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
    border-radius: var(--sys-radius-pill);
    z-index: 15;
  }

  #close-button:hover {
    color: var(--sys-color-text);
    background: var(--sys-color-surface-raised);
  }

  #close-button:active {
    transform: scale(0.95);
  }

  #close-button:focus-visible {
    outline: 2px solid var(--cta-primary);
    outline-offset: 2px;
  }


  dialog::backdrop {
    background: var(--sys-overlay-bg);
    backdrop-filter: blur(3px);
  }
</style>
