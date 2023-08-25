<script lang="ts">
    import {getContext} from "svelte";
    import {Icon} from "@steeze-ui/svelte-icon";
    import type {IconSource} from "@steeze-ui/svelte-icon/types";
    import {type InternalSidebarContext, InternalSidebarContextKey} from "../types";
    import {tooltip, type TooltipParams} from "../../../actions/Tooltip";

    export let icon: IconSource | undefined = undefined;
    export let label: string;

    let context = getContext<InternalSidebarContext>(InternalSidebarContextKey);
</script>

<li on:click on:keydown on:keypress>
    <button
        class="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-700 h-10 w-full text-gray-400 hover:text-white"
        use:tooltip={{
            content: label,
            position: "right",
            active: $context.showTooltips,
        }}
    >
        {#if icon}
            <Icon src={icon} class="w-6 h-6 transition duration-75" />
        {:else}
            <span class="w-6 text-center text-lg">
                {#if $context.iconOnly}
                    {label.charAt(0).toUpperCase()}
                {/if}
            </span>
        {/if}
        {#if !$context.iconOnly}
            <span class="ml-3">{label}</span>
            <div class="flex-1 flex justify-end">
                <slot />
            </div>
        {/if}
    </button>
    <slot name="siblings" />
</li>
