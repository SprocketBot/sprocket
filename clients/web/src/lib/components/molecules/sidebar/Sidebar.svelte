<script lang="ts">
    import {setContext} from "svelte";

    import type {SidebarWidth} from "./types";
    import {type SidebarContext, SidebarContextKey} from "./types";

    export let withHeader = true;
    export let width: SidebarWidth = "md";
    export let fullHeight = true;

    const context: SidebarContext = {iconOnly: false, showTooltips: true};
    if (width === "sm") context.iconOnly = true;
    if (width === "full") context.showTooltips = false;
    setContext<SidebarContext>(SidebarContextKey, context);
</script>

<aside class="size-{width}" aria-label="Sidebar" class:h-full={fullHeight}>
    <div class="overflow-y-auto py-4 px-3 rounded bg-gray-800 h-full flex flex-col">
        <ul class="flex flex-col gap-2 mb-4 flex-1 overflow-y-auto">
            {#if withHeader}
                <header class="mb-4">
                    <!-- TODO: remove /static from this URL, that is only to make it work in histoire -->
                    {#if width === "sm"}
                        <img src="/static/img/logo-square-primary.png" alt="Sprocket" />
                    {:else}
                        <img src="/static/img/logo-full-dark.png" alt="Sprocket" />
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
