<script lang="ts">
    import {OpenScrimsContext} from "$lib/api";
    import {Button} from "$lib/components";

    const openScrims = OpenScrimsContext();
</script>

{#each $openScrims ?? [] as scrim}
    {scrim.id} | {scrim.status}
{:else}
    "Hi, there are no currently observable scrims available."
{/each}