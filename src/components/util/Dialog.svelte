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
<dialog bind:this={modal} id="dialog-box">
  <button id="close-button" type='button' onclick={onClose} aria-label="Close">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </button>
  <div title={title}>
    {@render children()}
  </div>
</dialog>


<style>
  #dialog-box {
    position: relative;
    overflow: unset;
    place-self: center;
    border: none;
    border-radius: 12px;
    padding: 0;
    width: clamp(300px,90svw, 600px);
    color: var(--bg-high-contrast);
    box-shadow: 
      0 2px 8px oklch(from var(--bg-high-contrast) l c h / 0.04),
      0 8px 24px oklch(from var(--bg-high-contrast) l c h / 0.08),
      0 16px 48px oklch(from var(--bg-high-contrast) l c h / 0.12);
    z-index: 10;
  }

  #close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--bg-medium-contrast);
    cursor: pointer;
    transition: all 0.15s ease;
    border-radius: 6px;
    z-index: 15;
  }

  #close-button:hover {
    color: var(--bg-high-contrast);
    background: oklch(from var(--bg-low-contrast) l c h / 0.5);
  }

  #close-button:active {
    transform: scale(0.95);
  }

  #close-button:focus-visible {
    outline: 2px solid var(--cta-primary);
    outline-offset: 2px;
  }


  dialog::backdrop {
    position: fixed;
    inset: 0;
    background-color: var(--bg-high-contrast);
    backdrop-filter: blur(12px) sepia(70%) opacity(30%);
    opacity: 0.7;
  }
</style>
