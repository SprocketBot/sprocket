<script lang="ts">
  import type {ImageTypeItem} from "src/types";

  export let type: ImageTypeItem;
  export let select: (id: string) => unknown = () => {};
</script>

<div class="item">
  <h2>
    {type.displayName}
  </h2>
  <p>{type.description}</p>
  
    <button
      on:click={() => {
        select(type.reportCode);
      }}>Select</button
    >
  
</div>

<style lang="postcss">
  div {
    @apply mb-4;
  }
  p {
    @apply font-light text-sm;
  }
  button {
    @apply bg-primary-500 hover:bg-primary-600 text-sproc_dark_gray-500 p-1 w-20 float-right mt-2;
  }
  h2 {
    @apply overflow-ellipsis whitespace-nowrap min-w-0 overflow-hidden font-bold text-primary-500;
  }
</style>
