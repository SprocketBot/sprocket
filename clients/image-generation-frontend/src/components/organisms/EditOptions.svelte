<script lang="ts">
import {goto} from "$app/navigation";
import type {ImageTypeItem} from "$src/types";
import SavedInputSelector from "../molecules/SavedInputSelector.svelte";

export let imageTypeItem: ImageTypeItem;
export let savedImages: string[];
let filename = "";

</script>


<h2>Pick a project to Edit</h2>
<SavedInputSelector bind:value={filename} {savedImages}/>
<button disabled={filename === ""} on:click={async () => goto(`/edit/${imageTypeItem.reportCode}/${filename}`)}>GO!</button>

<style lang="postcss">
  h2 {
        @apply text-lg font-bold  border-b-primary-500 my-2;
    }
  button {
      @apply justify-self-end px-2 py-1 bg-primary-500 hover:bg-primary-600 m-4 text-sproc_dark_gray-500 mb-2;
  }
  button:disabled {
      @apply cursor-default bg-primary-700;
  }
</style>