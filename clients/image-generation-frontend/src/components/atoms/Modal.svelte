<style lang="postcss">
    section {
        @apply z-50 top-0 left-0 h-screen w-screen fixed bg-sproc_dark_gray-500 bg-opacity-90 flex justify-center items-center;
    }
    div.container {
        @apply p-8 bg-sproc_light_gray-900 text-sproc_light_gray-100 relative;
    }
    div.icon {
        @apply w-8 h-8 block absolute top-4 right-4 cursor-pointer;
    }
</style>

<script lang="ts" context="module">
    export const MODAL_CLOSE_CONTEXT_KEY = "Modal.Close";
</script>

<script lang="ts">
    import {fade} from "svelte/transition";
    import MdClose from "svelte-icons/md/MdClose.svelte";
    import {setContext} from "svelte";
    export let show = false;

    setContext(MODAL_CLOSE_CONTEXT_KEY, () => {
        show = false;
    });
</script>

{#if show}
    <section transition:fade={{duration: 250}}>
        <div class="container">
            <div
                class="icon"
                on:click={() => {
                    show = false;
                }}
            >
                <MdClose />
            </div>
            <slot />
        </div>
    </section>
{/if}
