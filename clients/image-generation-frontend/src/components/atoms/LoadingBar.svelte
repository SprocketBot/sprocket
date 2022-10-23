<style lang="postcss">
    .loading-bar {
        @apply bg-sproc_light_gray-50 w-64 h-12;
    }
    .bar {
        @apply bg-primary-500 h-full;
    }
</style>

<script lang="ts">
    import {uploadProgress, downloadProgress} from "$src/stores";
    export let direction = "upload";

    let progress: number;
    $: {
        direction === "up"
            ? (progress = $uploadProgress)
            : (progress = $downloadProgress);
    }
</script>

<div class="loading-bar">
    <div class="bar" style="width:{progress * 100}%">
        {Math.floor(progress * 100)} %
    </div>
</div>
