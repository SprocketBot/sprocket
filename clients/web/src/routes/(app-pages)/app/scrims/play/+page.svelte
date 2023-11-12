<script lang="ts">
    import {OpenScrimsContext, CurrentScrimContext} from "$lib/api";
    import {Button} from "$lib/components";
    import { UserProfileStore } from "$houdini";
    import CreateScrimModal from "./CreateScrimModal.svelte";

    const openScrims = OpenScrimsContext();
    const currentScrim = CurrentScrimContext();
    const currentUser = UserProfileStore();

    let openScrimModal = false;
</script>

<div class="w-full flex justify-between">
    <h1 class="text-6xl text-primary font-bold">Scrim Search</h1>
    <div>
        <Button variant="primary" outline size="sm" on:click={() => (openScrimModal = true)}>Create Scrim</Button>
    </div>
</div>

{#if $currentScrim.fetching || $currentUser.fetching}
    <span>Querying scrims ...</span>
{:else if currentUserFranchises?.includes("FP")}
    <section class="flex flex-col justify-center items-center h-full gap-4">
        <span class="text-7xl font-bold text-primary">Former Players Cannot Scrim</span>
    </section>
{:else if $currentScrim.data?.currentScrim}
    <QueuedView/>
{:else if scrimsAreDisabled}
    <DisabledView/>
{:else}
    <AvailableScrimsView/>
{/if}

{#each $openScrims ?? [] as scrim}
{:else}
    There are no scrims available; why don't you create one?
    <Button variant="primary" outline size="sm" on:click={() => (openScrimModal = true)}>Create a Scrim</Button>
{/each}

{#if openScrimModal}
    <CreateScrimModal bind:open={openScrimModal} />
{/if}
