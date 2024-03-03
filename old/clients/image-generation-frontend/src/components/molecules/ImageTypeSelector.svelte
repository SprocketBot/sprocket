<script lang="ts">

  import type {ImageTypeItem} from "src/types";

  export let imageTypeItems: ImageTypeItem[];
  export let value;
</script>

<select bind:value>
  {#each imageTypeItems as imageTypeItem}
    <option value={imageTypeItem}>
      <div>{imageTypeItem.displayName}</div>
      <div>{imageTypeItem.description}</div>
    </option>
  {/each}
</select> 

<style lang="postcss">
  select {
    @apply bg-primary-500 text-sproc_light_gray-800 px-2 py-1 w-full box-content;
  }
  option{
    @apply flex ;
  }
</style>
