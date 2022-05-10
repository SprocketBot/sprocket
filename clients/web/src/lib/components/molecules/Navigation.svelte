<script lang="ts">
    import type {NavigationItem} from "$lib/types";
    import {NavigationContextKey} from "$lib/types";
    import {getContext} from "svelte";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";

    // Use context so items can remain dynamic at the page level.
    const items = getContext<NavigationItem[]>(NavigationContextKey);

    const currentRoute = $page.url.pathname;

    const nav = async (target: string): Promise<unknown> => goto(target);
</script>

<nav>
    <ul class="menu">
        {#each items as item}
            <li class:active={item.target === currentRoute} on:click={async () => nav(item.target)}>
                <a>{item.label}</a>
            </li>
        {/each}
    </ul>
</nav>


<style lang="postcss">
    nav {
        @apply w-full;
    }
    .active {
        @apply bordered bg-gray-800;
    }
    div {
        @apply p-4 select-none leading-4 cursor-pointer bg-gray-500 bg-opacity-10;

        &.active {
            @apply bg-gray-50 font-bold bg-opacity-10;
        }

        &:hover {
            @apply bg-opacity-20;
        }

        &:active {
            @apply bg-opacity-25;
        }
    }
</style>