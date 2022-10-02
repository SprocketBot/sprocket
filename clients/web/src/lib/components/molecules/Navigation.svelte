<script lang="ts">
    import {navigationStore} from "$lib/stores";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";

    const currentRoute = $page.url.pathname;
</script>

<nav>
    <ul class="menu">
        {#each $navigationStore as item}
            <li class:active={item.target === currentRoute} on:click={async () => goto(item.target)}>
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