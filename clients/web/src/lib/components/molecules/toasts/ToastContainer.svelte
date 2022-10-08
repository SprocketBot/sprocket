<style lang="postcss">
    section {
        @apply absolute bottom-8 left-8;
        z-index: 10000;
    }

    ul {
        @apply stack;
    }

    .toast {
        /*@apply relative bg-accent px-4 py-4 rounded text-gray-50 break-all;*/
        @apply relative cursor-pointer alert alert-info;
    }

    .close {
        @apply absolute h-8 w-8 bg-gray-50 text-secondary rounded-full p-1 -top-2 -right-2
            /*hover:h-8 hover:w-8 hover:-top-3 hover:-right-3 transition-all cursor-pointer*/
        z-10 text-center font-bold leading-6;
    }
</style>

<script lang="ts">
    import {fade, fly} from "svelte/transition";
    import FaInfoCircle from "svelte-icons/fa/FaInfoCircle.svelte";

    import {Portal} from "$lib/components";

    import type {Toast} from "./ToastStore";
    import {toasts} from "./ToastStore";
    export let showTestButton = false;

    function removeToast(t: Toast, node: HTMLLIElement): void {
        if (node.parentElement?.firstChild === node) {
            if (t.id) {
                toasts.remove(t.id);
            }
        }
    }
</script>

<Portal>
    <section>
        <ul>
            {#each $toasts as toast (toast.id)}
                <li
                    class="toast"
                    in:fade
                    out:fly={{y: -5, duration: 200}}
                    on:click={e => {
                        removeToast(toast, e.currentTarget);
                    }}
                >
                    <span class="w-4 h-4">
                        <FaInfoCircle />
                    </span>
                    {toast.content}
                </li>
            {/each}
        </ul>
        {#if $toasts?.length > 3 && false}
            <div class="close">
                {$toasts?.length}
            </div>
        {/if}
    </section>
    {#if showTestButton}
        <div class="left-1/3 absolute bottom-8">
            <button
                class="btn btn-secondary relative block"
                on:click={() => {
                    toasts.pushToast({
                        status: "info",
                        content: `Notification${Math.random()}`,
                    });
                }}
                >Create Notification
            </button>
        </div>
    {/if}
</Portal>
