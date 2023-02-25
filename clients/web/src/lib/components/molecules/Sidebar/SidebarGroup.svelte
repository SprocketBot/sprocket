<script lang="ts">
    import {slide} from "svelte/transition";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {ChevronUp} from "@steeze-ui/heroicons";
    import type {IconSource} from "@steeze-ui/svelte-icon/types";
    import SidebarItem from "./atoms/SidebarItem.svelte";

    export let icon: IconSource | undefined;
    export let label: string;

    export let collapsed = true;
</script>

<SidebarItem {label} {icon} on:click={() => (collapsed = !collapsed)}>
    <span class="transition duration-500" class:-rotate-180={collapsed}><Icon src={ChevronUp} class="h-5 w-5" /></span>
    <div slot="siblings" class="contents">
        {#if !collapsed}
            <div transition:slide>
                <slot />
            </div>
        {/if}
    </div>
</SidebarItem>
