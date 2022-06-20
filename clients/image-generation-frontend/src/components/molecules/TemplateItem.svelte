<script lang="ts">
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
import { applicableOperations } from "../../utils/SvgRules";

    import Accordion from "../atoms/Accordion.svelte";

    export let item: any = {};
    export let key: string = "Variables";
    const selectedEl = getContext<Writable<SVGElement>>("selectedEl");
    let shown = false;
</script>

<Accordion>
    <div slot="header" let:shown class="item">
        <span class="open-indicator"
            >{shown || !Object.keys(item).length ? "-" : "+"}</span
        >
        <span class="name">{key}</span>
        <span class="spacer" />
        <span class="actions" />
    </div>
    <div slot="content" class="container">
        {#if item.hasOwnProperty("description")}
            <span>{item.description}</span>
            {#if $selectedEl && applicableOperations[$selectedEl.nodeName].includes(item.type) }
                <button>Use</button>
            {/if}
        {:else}
            {#each Object.entries(item) as [key, child]}
                <svelte:self item={child} {key} />
            {/each}
        {/if}
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
