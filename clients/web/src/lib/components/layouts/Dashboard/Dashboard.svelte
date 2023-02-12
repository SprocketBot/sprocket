<script lang="ts">
    import Navbar from "../../molecules/Navbar/Navbar.svelte";
    import SidebarItem from "../../molecules/Sidebar/atoms/SidebarItem.svelte";
    import Sidebar from "../../molecules/Sidebar/Sidebar.svelte";

</script>
<main>
    <Navbar class="col-span-2"/>
    <Sidebar withHeader={false} showTooltips={false}>
        <SidebarItem label="Item 1"/>
    </Sidebar>
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