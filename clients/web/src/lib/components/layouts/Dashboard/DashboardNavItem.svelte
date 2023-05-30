<script lang="ts">
    import {goto} from "$app/navigation";
    import {SidebarItem, SidebarGroup, SidebarDivider} from "../../molecules";
    import type {NavTreeItem} from "./types";
    export let item: NavTreeItem;
</script>

{#if item.divider}
    <SidebarDivider />
{:else if item.children}
    <SidebarGroup label={item.label} icon={item.icon}>
        {#each item.children as child}
            <svelte:self item={{...child, pathPart: item.pathPart + "/" + child.pathPart}} />
        {/each}
    </SidebarGroup>
{:else}
    <SidebarItem label={item.label} icon={item.icon} on:click={() => goto(item.pathPart)} />
{/if}
