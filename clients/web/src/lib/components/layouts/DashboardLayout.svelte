<script lang="ts">
    import {goto} from "$app/navigation";

    import FaBars from "svelte-icons/fa/FaBars.svelte";

    import {Avatar, Navigation} from "$lib/components";
    import {user} from "$lib/stores/user";
</script>


<main>
    <nav class="navbar border-b-primary/20 border-b-2 pl-4 pr-16 h-20">
        <header class="navbar-start">
            <h1 class="hidden">Sprocket</h1>
            <img src="/img/logo-horizontal.svg" alt="Sprocket" class="h-8"/>
        </header>

        <div class="navbar-center">
            <label for="nav-drawer" class="btn btn-ghost drawer-button flex justify-center items-center h-8 px-4 lg:hidden">
                <span class="w-6 h-6 mr-2">
                    <FaBars/>
                </span>
                Menu
            </label>
        </div>

        <div class="navbar-end">
            {#if $user}
                <Avatar class="h-12 w-12 mr-4"/>
                {$user.username}
            {:else}
                <button class="btn btn-outline" on:click={async () => goto("/auth/login")}>Sign In</button>
            {/if}
        </div>
    </nav>
    <div class="drawer drawer-mobile h-full w-full flex-1">
        <input id="nav-drawer" type="checkbox" class="drawer-toggle">

        <div class="drawer-content">
            <!-- Page -->
            <section>
                <slot/>
            </section>
        </div>
        <div class="drawer-side">
            <!-- Sidebar -->
            <label for="nav-drawer" class="drawer-overlay"></label>
            <div class="px-4 w-56 py-16">
                <Navigation/>
                <slot name="sidebar"/>
            </div>
        </div>
    </div>
</main>

<style lang="postcss">
    main {
        @apply bg-gradient-to-br from-base-200 via-base-300 to-black
        h-screen w-screen flex flex-col;
    }
    section {
        @apply p-4 h-full flex flex-col py-20 lg:py-4 grid gap-8
        grid-cols-6;
        grid-auto-rows: minmax(min-content, 12rem);

    }
</style>
