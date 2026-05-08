<script lang="ts">
  import { X } from '@lucide/svelte'
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
  <button id="close-button" class="icon-button" type='button' onclick={onClose}>
    <X size="20" stroke="0" />
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
    border: 1px solid var(--bg-medium-contrast);
    /* transform: translateY(-70%); */
    width: clamp(300px,90svw, 600px);
    /*background: var(--bg-low-contrast);*/
    color: var(--bg-high-contrast);
    box-shadow: 10px 10px 30px var(--bg-medium-contrast);
    z-index: 10;
  }

  #close-button {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    line-height: 1.5;
    /*height: 1.5rem;
    width: 1.5rem;*/
    /* z-index: 15; */
    border-radius: var(--border-radius);
    border: none;
  }


  dialog::backdrop {
    position: fixed;
    inset: 0;
    background-color: var(--bg-high-contrast);
    backdrop-filter: blur(12px) sepia(70%) opacity(30%);
    opacity: 0.7;
  }
</style>
