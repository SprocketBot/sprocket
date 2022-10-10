<style lang="postcss">
    div.container {
        @apply pl-6;
    }
    div.item {
        @apply flex items-center justify-center cursor-pointer mb-1 max-w-full;
    }
    span:not(.spacer) {
        @apply mr-4;
    }
    button {
        @apply bg-primary-500 hover:bg-primary-600 text-sproc_dark_gray-500 p-1 w-20;
    }
    button.outline {
        @apply bg-transparent border-primary-500 border-2 text-primary-500;
    }
    span.name {
        @apply overflow-ellipsis whitespace-nowrap min-w-0 overflow-hidden;
    }
    span.spacer {
        @apply flex-1 flex px-4;
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

<script lang="ts">
    import {indicatorBounds, selectedEl} from "$src/stores";
    import {
        friendlyLookup,
        hiddenElements,
        selectableElements,
    } from "$utils/SvgRules";
    import Accordion from "$components/atoms/Accordion.svelte";

    export let ref: SVGElement;
    /**
     * Used to prevent the mouseleave event from having an effect when a button is clicked.
     */
    let shouldUpdateBounds = true;
    function updateBounds(value: boolean) {
        if (!shouldUpdateBounds) return;
        const rect = ref.getBoundingClientRect();
        if (value) {
            $indicatorBounds = {
                x: rect.x,
                y: rect.y,
                w: rect.width,
                h: rect.height,
            };
        } else if ($indicatorBounds.x === rect.x) {
            // Check that the x matches, if it doesn't something else has been located and we shouldn't interfere

            $indicatorBounds = {
                x: -100,
                y: -100,
                h: 0,
                w: 0,
            };
        }
    }
    function updateSelection() {
        shouldUpdateBounds = false;
        if (ref === $selectedEl) {
            $selectedEl = undefined;
            updateBounds(false);
        } else {
            $selectedEl = ref;
            updateBounds(true);
        }
    }
    let children: SVGElement[];
    $: children = Array.from(ref.children).filter(
        c => !hiddenElements.includes(c.nodeName) && c instanceof SVGElement,
    ) as SVGElement[];
</script>

<Accordion>
    <div slot="header" class="item" let:shown>
        <span class="open-indicator">
            {shown || !children.length ? "-" : "+"}
        </span>
        <span class="name" title={ref.id}>
            {friendlyLookup[ref.nodeName] ?? ref.nodeName}{ref.id &&
                ` (${ref.id})`}
        </span>
        <span class="spacer" />
        <span class="actions">
            {#if selectableElements.includes(ref.nodeName)}
                <button
                    on:click|preventDefault|stopPropagation={updateSelection}
                    on:mouseover|preventDefault|stopPropagation={() => {
                        updateBounds(true);
                    }}
                    on:mouseleave|preventDefault|stopPropagation={() => {
                        updateBounds(false);
                    }}
                    on:focus|preventDefault|stopPropagation={() => {
                        updateBounds(true);
                    }}
                >
                    {$selectedEl === ref ? "Unselect" : "Select"}
                </button>
            {:else}
                <button
                    class="outline"
                    on:mouseover|preventDefault|stopPropagation={() => {
                        updateBounds(true);
                    }}
                    on:mouseleave|preventDefault|stopPropagation={() => {
                        updateBounds(false);
                    }}
                    on:click|preventDefault|stopPropagation
                    on:focus|preventDefault|stopPropagation={() => {
                        updateBounds(true);
                    }}
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
