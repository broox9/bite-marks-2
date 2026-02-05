<script lang="ts">
  import { X, Trash } from '@lucide/svelte';
  import type { ResultPlaceRecord } from "$lib/core/domain/Place/Place";
  import { resultsListController } from "$lib/adapters/primary/place-search.driver";
  import ResultList from '../ResultList.svelte';

  let currentSearchValue = $state('')
  let resultList = $state<ResultPlaceRecord[] | []>([])
  let selectedResult = $state<ResultPlaceRecord | null>(null)

  let props = $props()
  let { selectResultAction } = props

  const resultHandler = (results  : ResultPlaceRecord[]) => {
      resultList = results
  }

  async function searchHandler(e: Event) {
      const value = (e.currentTarget as HTMLInputElement | null)?.value;
      if (!value || value.length < 3) {
          resultList = [];
          return
      }
      await resultsListController({value, type: 'places', callback: resultHandler})
  }


  function selectResult(selectedPlace: ResultPlaceRecord) {
      selectedResult = selectedPlace
      selectResultAction(selectedPlace)
      listClearAction()
      // selectResultController(selectedPlace, callback)
  }

  // function resultSaveAction() {
  //     selectResultController(selectedResult, callback)
  // }

  function resultClearAction() {
      selectedResult = null
  }

  function listClearAction() {
      selectedResult = null
      resultList = []
      currentSearchValue = ''
  }

  function callback (stuff: any) {
    console.log('[bs] CALLBACK', stuff)
    console.dir(stuff)
    resultClearAction()
    listClearAction()
}

</script>


    <label for="search">
        <!-- <span>Search</span> -->
        <input
            type="search"
            id="search"
            bind:value={currentSearchValue}
            oninput={searchHandler}
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="results-list"
            aria-expanded={!!resultList.length}
            placeholder="Search for a spot"
        />
        <button type="button" class="icon-button" onclick={listClearAction}><Trash size={16} /></button>
    </label>

    <section class='mt-4'>
        {#if resultList.length > 0}
            <ResultList items={resultList} onSelect={selectResult}/>
        {/if}
    </section>
