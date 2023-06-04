<script lang="ts">
    import {Dashboard} from "$lib/components";
    import {ApplicationNavbar, CurrentScrimCard} from "$lib/components/organisms";
    import {NavTree} from "./nav-tree";
</script>

<Dashboard navTree={NavTree}>
    <ApplicationNavbar.Right slot="navbarRight" />
    <slot />

    <CurrentScrimCard slot="sidebar-footer" />
</Dashboard>
