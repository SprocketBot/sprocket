<script lang="ts">
    import {Portal} from "$lib/components";
    import {setContext} from "svelte";
    import {CLOSE_MODAL_CONTEXT} from "./types";
    import {XMark} from "@steeze-ui/heroicons";
    import {Icon} from "@steeze-ui/svelte-icon";

    export let open = false;
    export let title: string | undefined;

    const close = () => {
        open = false;
    };
    setContext(CLOSE_MODAL_CONTEXT, close);

    const hasHeader = $$slots.header;
    const hasFooter = $$slots.footer;
</script>

<!-- https://flowbite.com/docs/components/modal -->
{#if open}
    <Portal>
        <!-- Main modal -->
        <div
            id="defaultModal"
            tabindex="-1"
            aria-hidden={open ? "false" : "true"}
            class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-full flex justify-center sm:items-center"
        >
            <div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
                <!-- Modal content -->
                <div class="relative rounded-lg shadow bg-gray-700">
                    <button
                        type="button"
                        class="text-gray-400 bg-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-gray-600 hover:text-white absolute top-2 right-2"
                        on:click={close}
                    >
                        <Icon src={XMark} class="h-8" />
                        <span class="sr-only">Close modal</span>
                    </button>
                    <!-- Modal header -->
                    {#if title || hasHeader}
                        <div class="flex justify-between items-start p-4 rounded-t border-gray-600 border-b">
                            {#if hasHeader}
                                <slot name="header" />
                            {:else if title}
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                            {/if}
                        </div>
                    {/if}
                    <!-- Modal body -->
                    <div class="p-6">
                        <slot />
                    </div>
                    <!-- Modal footer -->

                    {#if hasFooter}
                        <div class="flex items-center p-6 space-x-2 rounded-b border-t border-gray-600">
                            <slot name="footer" />
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </Portal>
{/if}
