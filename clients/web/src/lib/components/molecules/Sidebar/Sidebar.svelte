<script lang="ts">
    import {setContext} from "svelte";
    import LogoSquarePrimary from "$lib/images/logo-square-primary.png";
    import LogoFullDark from "$lib/images/logo-full-dark.png";
    import type {SidebarWidth} from "./types";
    import {type SidebarContext, SidebarContextKey} from "./types";
    import {writable} from "svelte/store";

    export let withHeader = true;
    export let width: SidebarWidth = "md";
    export let fullHeight = true;
    export let showTooltips: boolean | undefined = undefined;

    const context: SidebarContext = writable({iconOnly: false, showTooltips: true});

    $: if (width === "sm") $context.iconOnly = true;
    else $context.iconOnly = false;

    $: if (width === "full" || width === "md") $context.showTooltips = false;
    else if (typeof showTooltips !== "undefined") $context.showTooltips = showTooltips;
    else $context.showTooltips = true;

    setContext<SidebarContext>(SidebarContextKey, context);

    $: console.log($context);
    $: console.log({width});
</script>

<aside class="size-{width} transition-width" aria-label="Sidebar" class:h-full={fullHeight}>
    <div class="overflow-y-auto py-4 px-3 bg-gray-800 h-full flex flex-col">
        <ul class="flex flex-col gap-2 mb-4 flex-1 overflow-y-auto">
            {#if withHeader}
                <header class="mb-4">
                    {#if width === "sm"}
                        <img src={LogoSquarePrimary} alt="Sprocket" />
                    {:else}
                        <img src={LogoFullDark} alt="Sprocket" />
                    {/if}
                </header>
            {/if}
            <slot />
        </ul>
        <slot name="footer" />
    </div>
</aside>

<style lang="postcss">
    aside.size-md {
        @apply w-64;
    }

    aside.size-sm {
        @apply w-16;
    }

    aside.size-full {
        @apply w-full;
    }
</style>
