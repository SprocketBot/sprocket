<script lang="ts">
    import {
        DashboardMobileHeader, Navigation, DashboardHeader,
    } from "$lib/components";
    import FaSignOutAlt from "svelte-icons/fa/FaSignOutAlt.svelte";
    import FaBackward from "svelte-icons/fa/FaBackward.svelte";
    import {goto} from "$app/navigation";
</script>


<div class="h-screen drawer drawer-mobile w-full">
    <input id="nav-drawer" type="checkbox" class="drawer-toggle">
    <div class="drawer-content">
        <DashboardMobileHeader/>
        <section class="p-4 h-full flex flex-col py-20 lg:py-4">
            <slot/>
        </section>
    </div>
    <div class="drawer-side">
        <label for="nav-drawer" class="drawer-overlay"></label>
        <aside>
            <header>
                <DashboardHeader/>
            </header>
            <div class="flex justify-between gap-8">
                <label for="nav-drawer" class="btn btn-primary drawer-button lg:hidden btn-outline mx-auto">
                    <span class="icon"><FaBackward/></span> Close
                </label>
                <button class="btn btn-outline btn-error" on:click={async () => goto("/auth/logout")}>
                    <span class="icon"><FaSignOutAlt/></span> Logout
                </button>
            </div>
            <Navigation/>
            <slot name="sidebar"/>
        </aside>
    </div>
</div>

<style lang="postcss">

    header {
        @apply mb-8 px-4;
    }

    aside {
        @apply bg-gray-900 py-4 w-96 lg:w-auto lg:px-0 flex flex-col items-center gap-1;
    }

    .drawer-content {
        @apply lg:p-4 p-0 relative h-full
                bg-gradient-to-b from-gray-800 to-gray-700
        ;
        /*background: linear-gradient(180deg, theme("colors.gray-600") 0%, theme("colors.gray-600") 65%);*/

    }

    .icon {
        @apply block w-4 h-4 mx-2;
    }
</style>
