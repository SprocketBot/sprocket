<style lang="postcss">
    div.icon {
        @apply h-8 cursor-pointer;
    }
    div.extention {
        @apply flex justify-center;
    }
    div.container {
        @apply mt-4 p-8 w-1/2 bg-sproc_light_gray-900 text-sproc_light_gray-100 border;
    }
</style>

<script lang="ts">
    export let reportCode: string;
    export let projectName: string;
    export let filename: string;

    import FaFileImage from "svelte-icons/fa/FaFileImage.svelte";
    import FaFileCode from "svelte-icons/fa/FaFileCode.svelte";
    import {downloadOutputImage} from "$src/api/outputs.api";

    const [, extention] = filename.split(".");

    async function downloadOutput() {
        const blob = await downloadOutputImage(
            reportCode,
            projectName,
            filename,
        );

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        a.remove();
    }
</script>

<div class="container">
    <div class="icon" on:click={async () => downloadOutput()}>
        {#if extention === "svg"}
            <FaFileCode />
        {:else}
            <FaFileImage />
        {/if}
    </div>
    <div class="extention">
        {extention.toUpperCase()}
    </div>
</div>
