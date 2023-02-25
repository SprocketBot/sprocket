<script lang="ts">
    import {Icon} from "@steeze-ui/svelte-icon";
    import type {IconSource} from "@steeze-ui/svelte-icon/types";
    import {formatDistance} from "date-fns";

    export let title: string;
    export let date: Date | undefined = undefined;
    export let icon: IconSource | undefined = undefined;
</script>

<li class="flex flex-row gap-4 items-center mb-2 last:mb-0" on:click>
    {#if icon}
        <div
            class="flex-shrink-0 w-7 h-7 -ml-3.5 bg-primary rounded-full ring-4 ring-gray-700 flex items-center justify-center"
        >
            <Icon class="w-3/4 h-3/4 text-gray-700" src={icon} theme="solid" />
        </div>
    {:else}
        <div
            class="flex-shrink-0 w-4 h-4 -ml-2 bg-gray-500 rounded-full ring-4 ring-gray-700 flex items-center justify-center"
        />
    {/if}

    <div class="flex-grow flex flex-col py-3 px-4 rounded-md hover:bg-white/5">
        <span class="text-gray-50 text-lg font-semibold leading-tight">{title}</span>

        {#if date}
            <time
                class="text-gray-300 text-sm font-normal mt-1"
                datetime={date.toISOString()}
                title={date.toLocaleString()}
            >
                {formatDistance(date, new Date(), {addSuffix: true})}
            </time>
        {/if}

        <span class="text-gray-200 text-base font-normal">
            <slot />
        </span>
    </div>
</li>

<style lang="postcss">
</style>
