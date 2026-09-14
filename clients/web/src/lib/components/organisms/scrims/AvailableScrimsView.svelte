<script lang="ts">
    import {pendingScrims, type PendingScrim} from "$lib/api";

    import {
        ScrimCard, ScrimTable, CreateScrimModal, JoinScrimModal, ResponsiveScrimList,
    } from "$lib/components";

    let scrims: PendingScrim[] | undefined;
    $: scrims = $pendingScrims.data?.pendingScrims;

    let createModalVisible = false;
    let joinModalVisible = false;
    let targetScrim: PendingScrim | undefined;

    const openCreateScrimModal = () => {
        createModalVisible = true;
    };
    const openJoinScrimModal = (scrim: PendingScrim) => {
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

    <ResponsiveScrimList>
        <svelte:fragment slot="cards">
            {#each scrims as scrim (scrim.id)}
                <ScrimCard {scrim} joinScrim={openJoinScrimModal} />
            {/each}
        </svelte:fragment>
        <svelte:fragment slot="table">
            <ScrimTable {scrims} joinScrim={openJoinScrimModal} />
        </svelte:fragment>
    </ResponsiveScrimList>
{/if}

{#if createModalVisible}
    <CreateScrimModal bind:visible={createModalVisible} />
{/if}
{#if joinModalVisible && targetScrim}
    <JoinScrimModal scrim={targetScrim} bind:visible={joinModalVisible} />
{/if}



<style lang="postcss">
    h2 {
        @apply text-2xl md:text-4xl font-bold text-sprocket mb-2;
    }
</style>
