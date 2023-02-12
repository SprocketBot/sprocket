<script lang="ts">
    import {Icon} from "@steeze-ui/svelte-icon"
    import {Bars3} from "@steeze-ui/heroicons"
    import { SmallScreenQuery, XSmallScreenQuery } from "../../../stores";
    import Drawer from "../../atoms/Drawer/Drawer.svelte";
    import type { SidebarWidth } from "../../molecules";
    import Navbar from "../../molecules/Navbar/Navbar.svelte";
    import SidebarItem from "../../molecules/Sidebar/atoms/SidebarItem.svelte";
    import Sidebar from "../../molecules/Sidebar/Sidebar.svelte";


    let sidebarExpanded = false;
    let sidebarType: SidebarWidth = "full";
    $: {
        // Order is important here
        if ($XSmallScreenQuery) {
            sidebarType = "full"
        }  else if ($SmallScreenQuery) {
            sidebarType = "sm"
        } else {
            sidebarType = "md"
        }
    }

</script>

<main>
    
    <Navbar class="col-span-2">
        <div slot="contentCenter" class="flex w-full items-center justify-center">
            <button on:click={() => sidebarExpanded = true}><Icon class="w-6 text-gray-50" src={Bars3}/></button>

        </div>
    </Navbar>

    {#if $XSmallScreenQuery}
    <Drawer bind:open={sidebarExpanded}>
        <Sidebar withHeader={$XSmallScreenQuery} width={sidebarType}>
            <SidebarItem label="Item 1"/>
        </Sidebar>
    </Drawer>
    {:else}
    <Sidebar withHeader={false} width={sidebarType}>
        <SidebarItem label="Item 1"/>
    </Sidebar>
    {/if}

    
    <section class="p-4 text-gray-50">
        <slot/>
    </section>
</main>

<style lang="postcss">
    main {
        @apply h-screen grid bg-gray-900;

        grid-template-rows: auto 1fr;
        grid-template-columns: auto 1fr;
        
    }
</style>