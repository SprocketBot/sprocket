<script lang="ts">
    import type { SortDirection } from "@tanstack/svelte-table";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { ChevronUp, ChevronDown } from "@steeze-ui/heroicons";

    export let direction: SortDirection | false | undefined = undefined;
    export let hovered: boolean | undefined = undefined;

    const activeColor = 'text-gray-50'
    const hoverColor = 'text-gray-200'
    const inactiveColor = 'text-gray-300'

    let upColor = "";
    let downColor = "";
    $: {
        upColor = hovered ? hoverColor : inactiveColor;
        downColor = hovered ? hoverColor : inactiveColor;
    
        if (direction === "asc") upColor = activeColor;
        if (direction === "desc") downColor = activeColor;
    }
</script>

<span class="w-8 h-8 flex flex-col items-center justify-center cursor-pointer">
    <Icon
        src={ChevronUp}
        theme="mini"
        class="w-4 h-4 {upColor}"
    />
    <Icon
        src={ChevronDown}
        theme="mini"
        class="w-4 h-4 {downColor}"
    />
</span>
