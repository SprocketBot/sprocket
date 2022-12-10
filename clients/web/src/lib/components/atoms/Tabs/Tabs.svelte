<script lang="ts">
    import type {TabItems} from "./types";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {nanoid} from "nanoid";

    type T = $$Generic<TabItems>;
    interface $$Props {
        tabs: TabItems;
        activeKey: keyof TabItems;
    }

    export let tabs: TabItems;
    export let activeKey: string;

    const id = nanoid();

    function keydown(e: KeyboardEvent) {
        const keys = Object.keys(tabs);
        const tabIdx = keys.indexOf(activeKey);

        switch (e.key) {
            case "ArrowLeft":
                if (tabIdx > 0) activeKey = keys[tabIdx - 1];
                break;
            case "ArrowRight":
                if (tabIdx < keys.length - 1) activeKey = keys[tabIdx + 1];
                break;
        }
    }
</script>

<div class="text-sm font-medium text-center border-b text-gray-400 border-gray-700">
    <ul class="flex flex-wrap -mb-px" role="tablist">
        {#each Object.keys(tabs) as key}
            <li class="mr-2">
                <button
                    on:keydown={keydown}
                    type="button"
                    class="inline-block p-2 rounded-t-lg border-2 border-transparent hover:text-gray-600 hover:text-gray-300 flex items-center gap-2 outline-none"
                    class:active={key === activeKey}
                    on:click={() => (activeKey = key)}
                    role="tab"
                    id="{id}-but"
                    aria-selected={`${key === activeKey ? "true" : "false"}`}
                    aria-controls={id}
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

{#each Object.keys(tabs) as key}
    <div
        class="relative pt-4"
        class:visible={key === activeKey}
        class:hidden={key !== activeKey}
        {id}
        aria-labelledby="{id}-but"
        role="tabpanel"
    >
        {#if key === activeKey}
            <svelte:component this={tabs[activeKey].component} {...tabs[activeKey].props} />
        {/if}
    </div>
{/each}

<style lang="postcss">
    button.active {
        @apply text-primary-600 border-b-primary-600;
    }
</style>
