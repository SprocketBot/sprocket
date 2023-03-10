<script lang="ts">
    import type {IconSource} from "@steeze-ui/svelte-icon/types";
    import {Icon} from "@steeze-ui/svelte-icon";

    export let icon: IconSource | undefined = undefined;
    let _class = "";
    export {_class as class};
</script>

<button
    type="button"
    class="relative inline-flex items-center w-full px-4 py-2 
    text-sm font-medium 
    border-b
    focus:z-10 focus:ring-2 
    border-gray-600 hover:bg-gray-600 hover:text-white focus:ring-gray-500 focus:text-white
    first:rounded-t-lg
    last:rounded-b-lg {_class}"
    class:pl-10={!icon}
    on:click
>
    {#if icon}
        <Icon src={icon} class="w-4 h-4 mr-2 fill-current" />
    {/if}
    <slot />
</button>
