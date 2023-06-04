<script lang="ts">
    import {OpenScrimsContext} from "$lib/api";
    import {Button} from "$lib/components";
    import CreateScrimModal from "./CreateScrimModal.svelte";

    const openScrims = OpenScrimsContext();

    let openScrimModal = false;
</script>

<div class="w-full flex justify-between">
    <h1 class="text-6xl text-primary font-bold">Scrim Search</h1>
    <div>
        <Button variant="primary" outline size="sm" on:click={() => (openScrimModal = true)}>Create Scrim</Button>
    </div>
</div>

{#each $openScrims ?? [] as scrim}
    {scrim.id} | {scrim.status}
{:else}
    There are no scrims available; why don't you create one?
    <Button variant="primary" on:click={() => (openScrimModal = true)}>Create a Scrim</Button>
{/each}

{#if openScrimModal}
    <CreateScrimModal bind:open={openScrimModal} />
{/if}
