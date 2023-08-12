<script lang="ts">
    import {ObservableScrimsContext} from "$lib/api";
    import {Card} from "$lib/components";
    import Accordion from "../../../../../lib/components/atoms/Accordion/Accordion.svelte";

    const observableScrims = ObservableScrimsContext();
</script>

<h2 class="text-2xl text-accent font-bold mb-8"> Currently active observable
scrims </h2>
{#each $observableScrims ?? [] as scrim}
    <Card>
        {#if !scrim.lobby}
            Scrim {scrim.id} does not yet have lobby information available.
        {:else if scrim.status === "IN_PROGRESS"}
                {scrim.id} | {scrim.status} | Lobby Info:
                {scrim.lobby.name}//{scrim.lobby?.password} 
        {:else}
                Scrim {scrim.id} is either not started or is missing lobby info, sorry. 
        {/if}
    </Card>
{:else}
    "Hi, there are no currently observable scrims available."
{/each}