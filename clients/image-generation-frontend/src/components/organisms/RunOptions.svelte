<script lang="ts">
  import {getFilterValues} from "$src/api/filters.api";
  import {getOutputs} from "$src/api/outputs.api";
  import {runReport} from "$src/api/run.api";
  import type {ImageTypeItem} from "$src/types";
  import LoadingIndicator from "../atoms/LoadingIndicator.svelte";
  import FilterDisplay from "../molecules/FilterDisplay.svelte";
  import OutputSelector from "../molecules/OutputSelector.svelte";

  import ReportFilters from "../molecules/ReportFilters.svelte";
  import SavedInputSelector from "../molecules/SavedInputSelector.svelte";

  export let imageTypeItem: ImageTypeItem;
  export let savedImages;

  let filterValues = {};
  let mode: "select" | "download" = "select";

  let projectName = "";
  let inputFileName;
  let outputFileName;

  let outputs;
  let running = false;

  async function refetchOutputs() {
      outputs = getOutputs(imageTypeItem.reportCode, projectName);
  }

  async function run() {
      running = true;
      await runReport(
          imageTypeItem.reportCode,
          inputFileName,
          outputFileName,
          filterValues,
      );
      refetchOutputs();
      running = false;
  }

  function getFilterName(filters) {
      let name = "";
      for (const key in filters) {
          name += `${filters[key]}_`;
      }
      return name === "" ? name : name.slice(0, -1);
  }

  function outputsForFilters(files: string[]) {
      return files.filter(name => name.startsWith(getFilterName(filterValues)));
  }

  $: {
      inputFileName = `${imageTypeItem.reportCode}/${projectName}/template.svg`;
      refetchOutputs();
  }
  $: {
      outputFileName = `${
          imageTypeItem.reportCode
      }/${projectName}/outputs/${getFilterName(filterValues)}`;
  }
</script>

{#if mode === "select"}
  <h2>Pick a project to Run</h2>
  <SavedInputSelector bind:value={projectName} {savedImages} />
{/if}

{#await getFilterValues(imageTypeItem.reportCode)}
  <h2>Loading...</h2>
{:then filters}
  {#if mode === "select"}
    <h2>Select your filters</h2>

    <ReportFilters bind:values={filterValues} {filters} />
    <button
      disabled={projectName === ""}
      on:click={() => {
        mode = "download";
      }}>--></button
    >
  {:else}
    <div class="header">
      <button on:click={() => { mode = "select" }}> back</button>
      <FilterDisplay {projectName} {filterValues} />
      <button on:click={async () => refetchOutputs()}>refresh</button>
    </div>

    {#await outputs}
      Grabbing previously generated images
    {:then out}
      {#if outputsForFilters(out).length > 0}
        <h2>Download an Image already run</h2>
        <div class="images">
          {#each outputsForFilters(out) as filename}
            <OutputSelector reportCode={imageTypeItem.reportCode} {projectName} {filename} />
          {/each}
        </div>
      {:else}
        <h2>There are no images for this report yet</h2>
      {/if}
    {/await}
    <h2>Send to Service</h2>
    <button disabled={running} on:click={async () => run()}>
      {#if running}
        <LoadingIndicator />
      {:else}
        Run
      {/if}
    </button>
  {/if}
{:catch}
  <h2>Error gathering filter values</h2>
{/await}

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
  div.images {
    @apply flex;
  }
  div.header {
    @apply flex mt-4 justify-between;
  }
</style>
