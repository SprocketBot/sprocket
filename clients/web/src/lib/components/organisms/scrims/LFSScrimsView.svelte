<script lang="ts">
    import {LFSScrims, type LFSScrim} from "$lib/api";

    import {
        ScrimCard, ScrimTable, CreateScrimModal, JoinScrimModal,
    } from "$lib/components";

    let scrims: LFSScrim[] | undefined;
    $: scrims = $LFSScrims.data?.LFSScrims;

    let createModalVisible = false;
    let joinModalVisible = false;
    let targetScrim: LFSScrim | undefined;

    const openCreateScrimModal = () => {
        createModalVisible = true;
    };
    const openJoinScrimModal = (scrim: LFSScrim) => {
        targetScrim = scrim;
        joinModalVisible = true;
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
            <ScrimCard {scrim} joinScrim={openJoinScrimModal} />
        {/each}
    </div>
    <div class="hidden md:block">
        <ScrimTable {scrims} joinScrim={openJoinScrimModal} />
    </div>
{/if}

{#if createModalVisible}
    <CreateScrimModal bind:visible={createModalVisible} lfs={true} />
{/if}
{#if joinModalVisible && targetScrim}
    <JoinScrimModal scrim={targetScrim} bind:visible={joinModalVisible} />
{/if}



<style lang="postcss">
    h2 {
        @apply text-4xl font-bold text-sprocket mb-2;
    }
</style>