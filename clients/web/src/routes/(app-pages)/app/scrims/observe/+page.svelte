<script lang="ts">
    import {OpenScrimsContext} from "$lib/api";
    import {Button} from "$lib/components";

    const openScrims = OpenScrimsContext();
</script>

{#each $openScrims ?? [] as scrim}
    {#if scrim.status === "IN_PROGRESS" && scrim.observable && scrim.lobby}
    {scrim.id} | {scrim.status} | Lobby Info: {scrim.lobby.name}//{scrim.lobby?.password}
    {/if}
{:else}
    "Hi, there are no currently observable scrims available."
{/each}