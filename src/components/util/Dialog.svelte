<script lang="ts">
  import { X } from '@lucide/svelte'
  import Card from "./Card.svelte";


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
  <button id="close-button" class="clear" type='button' onclick={onClose}>
    <X size="24" stroke="1" />
  </button>
  <Card title={title}>
    {@render children()}
  </Card>
</dialog>


<style>
  #dialog-box {
    place-self: center;
    /* transform: translateY(-70%); */
    width: clamp(300px,90svw, 600px);
    position: relative;
    background: var(--bg-low-contrast);
    color: var(--bg-high-contrast);
    z-index: 10;
  }
  #close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }


  ::backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-medium-contrast);
    backdrop-filter: blur(8px) sepia(70%) opacity(30%);
    opacity: 0.7;
  }
</style>