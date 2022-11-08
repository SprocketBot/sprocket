<script lang="ts">
    import {XMark} from "@steeze-ui/heroicons";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {fly, fade, type FlyParams} from "svelte/transition";
    // Specific import to prevent circular dependency issues
    import {Portal} from "$lib/components/abstract";
    import {setContext} from "svelte";
    import {DRAWER_CLOSE_CONTEXT, type DrawerPosition} from "./types";

    export let open: boolean = false;
    export let position: DrawerPosition = "left";

    let flyProps: FlyParams = {};
    $: switch (position) {
        case "left":
        default:
            flyProps = {x: -100};
            break;
        case "right":
            flyProps = {x: 100};
            break;
        case "top":
            flyProps = {y: -100};
            break;
        case "bottom":
            flyProps = {y: 100};
            break;
    }

    function close() {
        open = false;
    }

    function handleKeyPress(e: KeyboardEvent) {
        if (open && e.key === "Escape") close()
    }


    setContext(DRAWER_CLOSE_CONTEXT, close);
</script>

<svelte:body on:keydown={handleKeyPress} />
{#if open}
    <Portal>
        <div
            class="fixed z-30 h-screen w-screen bg-gray-700/50 backdrop-blur top-0 left-0"
            transition:fade
            on:click={close}
        />
        <div
            class="fixed z-40 p-8 overflow-y-auto bg-gray-800 drawer {position} text-gray-200"
            tabindex="-1"
            transition:fly={flyProps}
        >
            <button
                type="button"
                class="text-gray-400 bg-transparent rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center hover:bg-gray-600 hover:text-white"
                on:click={close}
            >
                <span class="w-5 h-5"><Icon src={XMark} /></span>
                <span class="sr-only">Close menu</span>
            </button>
            <slot />
        </div>
    </Portal>
{/if}

<style lang="postcss">
    .drawer {
        &.left,
        &.right {
            @apply top-0 h-screen w-96;
            &.right {
                @apply right-0;
            }
            &.left {
                @apply left-0;
            }
        }
        &.top,
        &.bottom {
            @apply left-0 w-screen h-96;
            &.top {
                @apply top-0;
            }
            &.bottom {
                @apply bottom-0;
            }
        }
    }
</style>
