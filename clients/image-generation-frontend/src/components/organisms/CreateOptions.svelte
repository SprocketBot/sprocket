<script lang="ts">
  import {
      getImagesOfType, getTemplate, uploadTemplate,
  } from "$src/api";
  import ImageSelector from "../molecules/ImageSelector.svelte";
  import {session} from "$app/stores";
  import {goto} from "$app/navigation";
  import LoadingIndicator from "../atoms/LoadingIndicator.svelte";
  import type {ImageTypeItem} from "$src/types";

  export let imageTypeItem: ImageTypeItem;

  let filenames: string[];
  let filename = "";
  let previewEl: SVGElement = undefined;
  let canGo;

  let navigating = false;
  async function getFilenames(id) {
      filenames = undefined;
      filenames = await getImagesOfType(id);
  }

  async function go() {
      navigating = true;
      await uploadTemplate(previewEl, imageTypeItem.reportCode, filename);
      $session = {
          previewEl: previewEl,
          imageType: await getTemplate(imageTypeItem.reportCode),
      };
      goto(`/edit/${imageTypeItem.reportCode}/${filename}`);
  }

  $: {
      canGo
      = filenames && previewEl && imageTypeItem
      && !filenames.includes(filename)
      && filename.length > 3
      && filename.match(/[A-Za-z0-9_]{4,}/)[0].length === filename.length;
  }

</script>


<h2>Give your project a name</h2>
<input type="text" bind:value={filename} /> 
    {#await getFilenames(imageTypeItem.reportCode)}
        <span>updating filenames</span>
    {:then filenames}
        {#if canGo === undefined}
            <span>select an image</span>
        {:else if !canGo}
            <span>choose unique name (4+ chars: A-Za-z0-9_)</span>
        {/if}
    {/await}
<h2>And Upload a template</h2>
<ImageSelector bind:previewEl/>
<button disabled={!canGo} on:click={async () => go()}>
    {#if navigating}
        <LoadingIndicator/>
    {:else}
        GO!
    {/if}
</button>

<style lang="postcss">


  h2 {
      @apply text-lg font-bold  border-b-primary-500 my-2;
  }
  
  input[type="text"] {
      @apply bg-primary-500 text-sproc_light_gray-600;
  }

  span {
      @apply px-4;
  }
  button {
      @apply justify-self-end px-2 py-1 bg-primary-500 hover:bg-primary-600 m-4 text-sproc_dark_gray-500 mb-2;
  }
  button:disabled {
      @apply cursor-default bg-primary-700;
  }
</style>
