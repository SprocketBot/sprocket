<script lang="ts">
    import type {TabItems} from "./types";
    import {Icon} from "@steeze-ui/svelte-icon";

    type T = $$Generic<TabItems>;
    interface $$Props {
        tabs: TabItems;
        activeKey: keyof TabItems;
    }

    export let tabs: TabItems;
    export let activeKey: keyof TabItems;
</script>

<div class="text-sm font-medium text-center border-b text-gray-400 border-gray-700">
    <ul class="flex flex-wrap -mb-px">
        {#each Object.keys(tabs) as key}
            <li class="mr-2">
                <button
                    type="button"
                    class="inline-block p-2 rounded-t-lg border-2 border-transparent hover:text-gray-600 hover:border-b-gray-300 hover:text-gray-300 flex items-center gap-2"
                    class:active={key === activeKey}
                    on:click={() => (activeKey = key)}
                >
                    {#if tabs[key].icon}
                        <Icon class="h-4 w-4" src={tabs[key].icon} />
                    {/if}
                    {key}
                </button>
            </li>
        {/each}
    </ul>
</div>
<div class="relative pt-4">
    {#each Object.keys(tabs) as key}
        {#if key === activeKey}
            <svelte:component this={tabs[activeKey].component} {...tabs[activeKey].props} />
        {/if}
    {/each}
</div>

<style lang="postcss">
    button.active {
        @apply text-primary-600 border-b-primary-600;
    }
</style>
