<script lang="ts">
    import FaBars from "svelte-icons/fa/FaBars.svelte";

    import {Navigation, UserMenu} from "$lib/components";
</script>


<main>
    <nav class="navbar border-b-primary/20 border-b-2 px-2 lg:px-4">
        <div class="navbar-start lg:hidden">
            <label for="nav-drawer" class="btn btn-ghost lg:btn-lg btn-sm drawer-button flex justify-center items-center">
                <span class=" h-3/4 mr-2">
                    <FaBars/>
                </span>
                Menu
            </label>
        </div>

        <header class="navbar-center lg:navbar-start">
            <h1 class="hidden">Sprocket</h1>
            <img src="/img/logo-horizontal.svg" alt="Sprocket" class="hidden lg:block h-8"/>
            <img src="/img/logo-only.svg" alt="Sprocket" class="block lg:hidden h-8"/>
        </header>

        <div class="navbar-end">
            <UserMenu />
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
