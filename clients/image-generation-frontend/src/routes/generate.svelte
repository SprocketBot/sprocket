<!-- <script lang="ts">
    import ImageTypeSelector from "$components/organisms/ImageTypeSelector.svelte";
    import CardLayout from "$components/layouts/CardLayout.svelte";
    import ReportFilters from "$components/molecules/ReportFilters.svelte";
    import SavedInputSelector from "$components/molecules/SavedInputSelector.svelte";
    import { imageTypeId } from "$src//stores";
    import { runReport } from "$api/run.api";
    import { downloadImage } from "$src/api";

    let reportCode;
    let filterValues: Record<string, string>;
    let inputFile;
    let disable:boolean;

    function reportCodeSelected(e) {
        reportCode = e.detail;
    }

    async function generateReport(){
        let runTime = new Date().toJSON()
        let outFile = `${$imageTypeId}/output/${runTime}.png`
        if(await runReport(reportCode, inputFile, outFile, filterValues)){
            const base64ImageStr = await downloadImage(outFile);
            const a = document.createElement("a"); //Create <a>
            a.href = `data:image/png;base64,${base64ImageStr}`;
            a.download = `${runTime}.png`;
            a.click();
            a.remove();
        } else{
            alert("error running img gen")
        }
    }

    $:{
        disable = (inputFile === "" || filterValues=={})
    }
</script>

<CardLayout>
    <section>
        <h2>Generate Image</h2>
        {#if !reportCode}
            <ImageTypeSelector on:selected={reportCodeSelected} />
        {:else}
            <div class="form-wrapper">
                <h3>Select Filters</h3>
                <div class="filters">
                    <ReportFilters {reportCode} bind:values={filterValues} />
                </div>
                <span>
                    <h3>Select Input Image</h3>
                    <SavedInputSelector {reportCode} bind:value={inputFile} />
                </span>
            </div>

            <button disabled={disable} on:click={generateReport}>
                {#if disable}
                    Select things
                {:else}
                    Generate Image
                {/if}
            </button>
        {/if}
    </section>
</CardLayout>

<style lang="postcss">
    section {
        @apply px-4 py-4 bg-sproc_light_gray-800 w-1/2
        h-1/2 flex flex-col;
    }
    h2 {
        @apply text-xl font-bold text-center text-primary-500;
    }
    h3 {
        @apply text-lg font-bold text-center;
    }
    div.filters {
        @apply flex flex-col w-full mb-4;
    }
    div.form-wrapper {
        @apply flex-1;
    }
    span {
        @apply px-4 block;
    }
    button {
        @apply px-2 py-1 bg-primary-500 hover:bg-primary-600 mx-4 text-sproc_dark_gray-500 mb-2;
    }

    button:disabled{
        @apply cursor-default bg-primary-700;
    }
</style> -->
