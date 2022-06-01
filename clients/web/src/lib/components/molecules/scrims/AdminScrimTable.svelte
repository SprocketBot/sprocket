<script lang="ts">
    import {ScrimManagementModal} from "$lib/components";
    import {screamingSnakeToHuman} from "$lib/utils";

    /*
    This will be the table that shows in ScrimManagementModal (Currently Named Modal
    but I have since realized that it not the greatest)

    TODO: Populate all scrims list
    TODO: Create/Implement Search
    TODO: Figure out Visibility status pattern from CreateScrimModal and Scrim Table

     */

    export let visible = false;
    // Scrims are passed in.
    export let adminScrimsInTable;
    let scrimManagementModalVisible = false;
    let targetId;
    let lockimgsrc = "/img/lock_open.svg";
    let lockimgalt = "Open Lock";

    // TODO: Implement Lock Scrim Workflow
    const lockAllScrims = () => {
        if (lockimgsrc === "/img/lock_closed.svg") {
            lockimgsrc = "/img/lock_open.svg";
            lockimgalt = "Open Lock";
        } else {
            lockimgsrc = "/img/lock_closed.svg";
            lockimgalt = "Closed Lock";
        }

    };
    const openScrimManagementModal = scrimId => {
        scrimManagementModalVisible = true;
        targetId = scrimId;
    };
</script>

<table class="table text-center w-full" >
    <thead>
    <tr>
        <th>Scrim ID</th>
        <th>Game Mode</th>
        <th>Status</th>
        <th>
            <button class="float-right btn btn-outline btn-accent" on:click={lockAllScrims}>
                <img src = {lockimgsrc} alt= {lockimgalt} >
            </button>
        </th>
    </tr>
    </thead>
    <tbody>
    {#each adminScrimsInTable as scrim (scrim.id)}
        <tr>
            <td>{screamingSnakeToHuman(scrim.settings.mode)}</td>
            <td>{scrim.id}</td>
            <td>{scrim.gameMode.description}</td>
            <td>{scrim.status}</td>
            <td>
                <button on:click={() => { openScrimManagementModal(scrim.id) }} class="btn btn-outline float-right lg:btn-sm">
                    Manage
                </button>
            </td>
        </tr>
    {/each}

    </tbody>
</table>
{#if scrimManagementModalVisible}
    <ScrimManagementModal bind:visible={scrimManagementModalVisible}/>
{/if}
<!--{#if joinModalVisible}-->
<!--    <JoinScrimModal scrimId={targetId} bind:visible={joinModalVisible}/>-->
<!--{/if}-->

<!--<style lang="postcss">-->
<!--    table {-->
<!--        @apply select-none;-->

<!--    th {-->
<!--        @apply text-sm text-center py-3;-->

<!--    &:first-child {-->
<!--         @apply relative;-->
<!--     }-->
<!--    }-->
<!--    }-->
<!--</style>-->
