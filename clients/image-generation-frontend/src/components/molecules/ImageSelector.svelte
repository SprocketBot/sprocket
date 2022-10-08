<style lang="postcss">
    div {
        @apply flex mb-3;
    }
    input[type="file"] {
        @apply hidden;
    }
    label {
        @apply cursor-pointer w-5/6 text-center text-lg bg-primary-500 text-sproc_light_gray-700;
    }
</style>

<script lang="ts">
    import {getSVGData} from "$src/utils/svgData";

    import {tick} from "svelte";

    import LoadingIndicator from "../atoms/LoadingIndicator.svelte";

    export let previewEl;

    let working = false;
    let files: FileList;
    let filename: string;

    async function handleUpload(file) {
        working = true;
        await tick();
        const data = await getSVGData(file);
        previewEl = data.previewEl;
        filename = data.filename;
        await tick();
        working = false;
    }

    $: {
        if (files?.length) {
            handleUpload(files[0]);
        }
    }
</script>

<div>
    <label>
        {#if working}
            <LoadingIndicator />
        {:else if filename}
            {filename}
        {:else}
            Choose a file
        {/if}
        <input type="file" accept=".svg" id="upload" bind:files />
    </label>
</div>
