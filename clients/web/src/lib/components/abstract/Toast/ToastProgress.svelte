<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import type {IToast} from "./types";

    export let toast: IToast;

    const end = toast.timestamp + (toast.ttl ?? 0);

    let lastTime = window.performance.now();
    let frameId: number;

    function updateProgress() {
        lastTime = window.performance.now() - toast.timestamp;
        if (lastTime < (toast.ttl ?? 0)) {
            frameId = requestAnimationFrame(updateProgress);
        }
    }

    onMount(updateProgress);
    onDestroy(() => cancelAnimationFrame(frameId));
</script>

{#if toast.ttl}
    <div class="absolute bottom-0 left-0 h-1.5 w-full rounded-b-lg overflow-hidden">
        <div class="absolute bottom-0 left-0 bg-primary-500 h-full" style="width: {(lastTime / toast.ttl) * 100}%;" />
        <!-- <progress min={0} max={toast.ttl} value={lastTime} class="w-full h-1 absolute bottom-0 left-0" /> -->
    </div>
{/if}
