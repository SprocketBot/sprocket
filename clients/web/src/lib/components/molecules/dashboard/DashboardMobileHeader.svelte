<script lang="ts">
    import FaBars from "svelte-icons/fa/FaBars.svelte";
</script>
<nav>
    <div class="flex gap-8 items-center flex-1">
        <h1 class="hidden">Sprocket</h1>
        <img src="/img/logo-horizontal.svg" alt="Sprocket" class="h-8"/>
    </div>
    <label for="nav-drawer" class="btn btn-ghost drawer-button flex justify-center items-center h-8 px-4">
    <span class="w-6 h-6 mr-2">
        <FaBars/>
    </span>
        Menu
    </label>
</nav>

<style lang="postcss">
    nav {
        /* @apply h-16 bg-gray-900 absolute top-0 left-0 w-full py-2 px-8 flex items-center justify-between; */
        @apply navbar bg-gray-900 lg:hidden px-8 absolute top-0 left-0;
    }
</style>