<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import FaLock from "svelte-icons/fa/FaLock.svelte";

    export let scrim: CurrentScrim;
    if (!scrim) throw new Error();
</script>


<section class="flex flex-col justify-center items-center h-full gap-4">
    <span class="h-32 text-sprocket block"><FaLock/></span>
    <span class="text-7xl font-bold text-primary">Scrim Locked</span>
    <span class="text-4xl">Please contact support</span>
</section>
