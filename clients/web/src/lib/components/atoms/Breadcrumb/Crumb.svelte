<script lang="ts">
    import {Icon} from "@steeze-ui/svelte-icon";
    import {ChevronRight} from "@steeze-ui/heroicons";
    import type {ICrumb} from "./types";

    export let active: boolean = false;
    export let crumb: ICrumb;
    const {icon, label, target} = crumb;
</script>

<li class="inline-flex items-center">
    <a href={target} class:active class="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white">
        {#if icon}
            <Icon class="w-4 mr-1" src={icon} />
        {/if}
        {label}
    </a>
</li>
<li>
    {#if !active}
        <Icon src={ChevronRight} class="w-4 text-gray-400" />
    {/if}
</li>

<style lang="postcss">
    a {
        &.active {
            @apply text-gray-100;
        }
    }
</style>
