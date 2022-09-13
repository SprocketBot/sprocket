<script lang="ts">
  import {WorkState} from "$src/types";
  import LinkControls from "$components/molecules/LinkControls.svelte";
  import {previewEl, workstate} from "$src/stores";
  import FontControls from "$components/molecules/FontControls.svelte";
  import SaveControls from "$src/components/molecules/SaveControls.svelte";

  export let filename;
</script>

<section class="controls">
  <header>
    <h3 on:click={() => { $workstate = WorkState.Linking }} class={$workstate === WorkState.Linking ? "selected" : ""}>Assign Values</h3>
    <h3 on:click={() => { $workstate = WorkState.Fonts }} class={$workstate === WorkState.Fonts ? "selected" : ""}>Upload Font Files</h3>
    <h3 on:click={() => { $workstate = WorkState.Saving }} class={$workstate === WorkState.Saving ? "selected" : ""}>Save Image</h3>
  </header>
  <section class="container">
    {#if !$previewEl}
      downloading Image
    {:else}
      {#if $workstate === WorkState.Linking}
        <LinkControls />
      {:else if $workstate === WorkState.Fonts}
        <FontControls />
      {:else}
        <SaveControls {filename}/>
      {/if}
    {/if}
  </section>
</section>

<style lang="postcss">
  section.controls {
    @apply h-full;
  }
  section > header {
    @apply border-b-2 border-sproc_dark_gray-800 flex px-10 mt-2;
  }
  section > header .selected {
    @apply  bg-primary-500 text-sproc_light_gray-800 cursor-pointer;
  }
  section > header > h3 {
    @apply font-bold text-lg mx-2 p-1 text-sproc_light_gray-50 rounded-t-xl hover:bg-primary-700 cursor-pointer px-5;
  }
  .container {
    @apply overflow-auto
  }
</style>
