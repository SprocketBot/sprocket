<script lang="ts">
    import {Icon} from "@steeze-ui/svelte-icon";
    import {ChevronRight} from "@steeze-ui/heroicons";
    import type { ICrumb } from "./types";

    export let active: boolean = false;
    export let crumb: ICrumb
    const {icon, label, target} = crumb;
</script>

<li class="inline-flex items-center">
    <a href={target} class:active>
        {#if icon}
            <div class="w-4 mr-1">
                <Icon src={icon} />
            </div>
        {/if}
        {label}
    </a>
</li>
<li>
    {#if !active}
        <div class="w-4 text-gray-400">
            <Icon src={ChevronRight} />
        </div>
    {/if}
</li>

<style lang="postcss">
    a {
        @apply inline-flex items-center text-sm font-medium text-gray-400 hover:text-white;
        &.active {
            @apply font-medium text-gray-100;
        }
    }
</style>
