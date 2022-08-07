<script lang="ts">
    import {CreateScrimModal, JoinScrimModal} from "$lib/components";
    import {screamingSnakeToHuman} from "$lib/utils";

    export let scrims;

    let createModalVisible = false;
    let joinModalVisible = false;
    let targetId;

    const openCreateScrimModal = () => {
        createModalVisible = true;
    };
    const openJoinScrimModal = scrimId => {
        joinModalVisible = true;
        targetId = scrimId;
    };
</script>

<table class="table text-center w-full">
    <thead>
    <tr>
        <th>Game</th>
        <th>Skill Group</th>
        <th>Game Mode</th>
        <th>Scrim Type</th>
        <th>Players</th>
        <th/>
        <th>
            <button class="float-right lg:btn-sm btn btn-outline btn-accent" on:click={openCreateScrimModal}>
                Create Scrim
            </button>
        </th>
    </tr>
    </thead>
    <tbody>
    {#each scrims as scrim (scrim.id)}
        <tr>
            <td>{scrim.gameMode.game.title}</td>
            <td>{scrim.skillGroup.profile.description}</td>
            <td>{scrim.gameMode.description}</td>
            <td>{screamingSnakeToHuman(scrim.settings.mode)}</td>
            <td>{scrim.playerCount} / {scrim.maxPlayers}</td>
            <td>{scrim.settings.competitive ? "Competitive" : "Casual"}</td>
            <td>
                <button on:click={() => { openJoinScrimModal(scrim.id) }} class="btn btn-outline float-right lg:btn-sm">
                    Join
                </button>
            </td>
        </tr>
    {/each}
    </tbody>
</table>
{#if createModalVisible}
    <CreateScrimModal bind:visible={createModalVisible}/>
{/if}
{#if joinModalVisible}
    <JoinScrimModal scrimId={targetId} bind:visible={joinModalVisible}/>
{/if}

<style lang="postcss">
    table {
        @apply select-none;

        th {
            @apply text-sm text-center py-3;

            &:first-child {
                @apply relative;
            }
        }
    }
</style>
