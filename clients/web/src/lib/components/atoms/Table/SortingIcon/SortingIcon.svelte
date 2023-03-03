<script lang="ts">
    import type { SortDirection } from "@tanstack/svelte-table";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { ChevronUp, ChevronDown } from "@steeze-ui/heroicons";

    export let direction: SortDirection | false | undefined = undefined;
</script>

<span class="w-8 h-8 flex flex-col items-center justify-center cursor-pointer">
    <Icon src={ChevronUp} theme="mini" class="w-4 h-4 {direction === "asc" ? "text-gray-50" : "text-gray-300"}" />
    <Icon src={ChevronDown} theme="mini" class="w-4 h-4 {direction === "desc" ? "text-gray-50" : "text-gray-300"}" />
</span>
