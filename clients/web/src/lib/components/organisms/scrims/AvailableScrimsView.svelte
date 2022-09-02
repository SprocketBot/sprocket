<script lang="ts">
    import {pendingScrims, type PendingScrim} from "$lib/api";

    import {
        ScrimCard, ScrimTable, CreateScrimModal, JoinScrimModal,
    } from "$lib/components";

    let scrims: PendingScrim[] | undefined;
    $: scrims = $pendingScrims.data?.pendingScrims;

    let createModalVisible = false;
    let joinModalVisible = false;
    let targetId: string | undefined;

    const openCreateScrimModal = () => {
        createModalVisible = true;
    };
    const openJoinScrimModal = (scrimId: string) => {
        joinModalVisible = true;
        targetId = scrimId;
    };
</script>



{#if scrims === undefined}
    Loading...
{:else}
    <div class="flex flex-col md:flex-row justify-between mb-4">
        <h2>Available Scrims</h2>
        <button class="btn btn-primary w-full md:w-auto" on:click={openCreateScrimModal}>
            Create Scrim
        </button>
    </div>

    <div class="flex md:hidden flex-col gap-4">
        {#each scrims as scrim (scrim.id)}
            <ScrimCard {scrim} joinScrim={() => { openJoinScrimModal(scrim.id) }} />
        {/each}
    </div>
    <div class="hidden md:block">
        <ScrimTable {scrims} joinScrim={openJoinScrimModal} />
    </div>
{/if}

{#if createModalVisible}
    <CreateScrimModal bind:visible={createModalVisible} />
{/if}
{#if joinModalVisible && targetId}
    <JoinScrimModal scrimId={targetId} bind:visible={joinModalVisible} />
{/if}



<style lang="postcss">
    h2 {
        @apply text-4xl font-bold text-sprocket mb-2;
    }
</style>