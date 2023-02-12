<script lang="ts">
    import {Icon} from "@steeze-ui/svelte-icon";
    import {Bars3} from "@steeze-ui/heroicons";
    import {SmallScreenQuery, XSmallScreenQuery} from "../../../stores";
    import {Drawer} from "../../atoms/Drawer";
    import type {SidebarWidth} from "../../molecules/Sidebar";
    import {Navbar} from "../../molecules/Navbar";
    import {Sidebar, SidebarItem} from "../../molecules/Sidebar";
    import {setContext} from "svelte";
    import {BREADCRUMB_CONTEXT_KEY, type BreadcrumbContext} from "../../atoms/Breadcrumb";

    let sidebarExpanded = false;
    let sidebarType: SidebarWidth = "full";
    $: {
        // Order is important here
        if ($XSmallScreenQuery) {
            sidebarType = "full";
        } else if ($SmallScreenQuery) {
            sidebarType = "sm";
        } else {
            sidebarType = "md";
        }
    }
    // TODO: Pass breadcrumb context
    setContext<BreadcrumbContext>(BREADCRUMB_CONTEXT_KEY, []);
</script>

<main>
    <Navbar class="col-span-2">
        <div slot="contentCenter" class="flex w-full items-center justify-center">
            {#if $XSmallScreenQuery}
                <button on:click={() => (sidebarExpanded = true)}><Icon class="w-6 text-gray-50" src={Bars3} /></button>
            {/if}
        </div>
        <!-- TODO: Build out right side of the navbar -->
    </Navbar>

    <!-- TODO: See if there is a way to do this without redeclaring the sidebar -->
    <!-- TODO: See if there is a good way to dynamically add to the navigation; Hard coding that is a pain -->
    <!-- TODO: Add the footer to the sidebar -->
    {#if $XSmallScreenQuery}
        <Drawer bind:open={sidebarExpanded}>
            <Sidebar withHeader={$XSmallScreenQuery} width={sidebarType}>
                <SidebarItem label="Item 1" />
            </Sidebar>
        </Drawer>
    {:else}
        <Sidebar withHeader={false} width={sidebarType}>
            <SidebarItem label="Item 1" />
        </Sidebar>
    {/if}

    <section class="p-4 text-gray-50">
        <slot />
    </section>
</main>

<style lang="postcss">
    main {
        @apply h-screen grid bg-gray-900;

        grid-template-rows: auto 1fr;
        grid-template-columns: auto 1fr;
    }
</style>
