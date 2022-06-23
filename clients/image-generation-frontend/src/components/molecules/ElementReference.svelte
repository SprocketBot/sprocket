<script lang="ts" context="module">
</script>

<script lang="ts">
    import { getContext } from "svelte";

    import type { Writable } from "svelte/store";
    import type { BoundBox } from "../../types";
    import {
        friendlyLookup,
        hiddenElements,
        selectableElements,
    } from "../../utils/SvgRules";
    import Accordion from "../atoms/Accordion.svelte";

    export let ref: SVGElement;
    let shown = false;
    const indicatorBounds = getContext<Writable<BoundBox>>("indicatorBounds");
    const selectedEl = getContext<Writable<SVGElement>>("selectedEl");
    function updateSelection() {
        if (ref === $selectedEl) {
            $selectedEl = undefined;
            updateBounds(false);
        } else {
            $selectedEl = ref;
            updateBounds(true);
        }
    }
    function updateBounds(value: boolean) {
        const rect = ref.getBoundingClientRect();
        if (value) {
            $indicatorBounds = { x: rect.x, y: rect.y, w: rect.width, h: rect.height, };
        } else {
            // Check that the x matches, if it doesn't something else has been located and we shouldn't interfere
            if ($indicatorBounds.x === rect.x) {
                $indicatorBounds = { x: -100, y: -100, h: 0, w: 0 };
            }
        }
    }
    let children: SVGElement[];
    $: children = Array.from(ref.children).filter(
        (c) => !hiddenElements.includes(c.nodeName) && c instanceof SVGElement
    ) as SVGElement[];
</script>

<Accordion>
    <div slot="header" class="item" let:shown>
        <span class="open-indicator"
            >{shown || !children.length ? "-" : "+"}</span
        >
        <span class="name"
            >{friendlyLookup[ref.nodeName] ?? ref.nodeName}{ref.id &&
                ` (${ref.id})`}</span
        >
        <span class="spacer" />
        <span class="actions">
            {#if selectableElements.includes(ref.nodeName)}
                <button
                    on:click|preventDefault|stopPropagation={updateSelection}
                >
                    {$selectedEl == ref ? "Unselect" : "Select"}
                </button>
            {:else}
                <button
                    on:mousedown|preventDefault|stopPropagation={() =>
                        updateBounds(true)}
                    on:mouseup|preventDefault|stopPropagation={() =>
                        setTimeout(() => updateBounds(false), 250)}
                    on:click|preventDefault|stopPropagation
                >
                    Locate
                </button>
            {/if}
        </span>
    </div>
    <div slot="content" class="container">
        {#each children as child}
            <svelte:self ref={child} />
        {/each}
    </div>
</Accordion>

<style lang="postcss">
    div.container {
        @apply pl-6;
    }
    div.item {
        @apply flex items-center justify-center cursor-pointer;
    }
    /* span.open-indicator {
        @apply w-4;
    } */
    span:not(.spacer) {
        @apply mr-4;
    }
    button {
        @apply bg-gray-400 hover:bg-gray-500 p-1 w-20;
    }
    span.spacer {
        @apply flex-1 flex pr-5 pl-5;
    }
    span.spacer::after {
        content: "";
        background-image: linear-gradient(
            to right,
            black 15%,
            rgba(255, 255, 255, 0) 0%
        );
        background-position: bottom;
        height: 3px;
        background-size: 12px 1px;
        background-repeat: repeat-x;

        @apply flex-1;
    }
</style>
