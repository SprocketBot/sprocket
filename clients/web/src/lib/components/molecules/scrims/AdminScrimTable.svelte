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

    export let scrims;

    export let visible = false;

    let scrimManagement = false;

    const openCreateScrimModal = () => {
        //createModalVisible = true;
    };
    const openScrimManagementModal = scrimId => {
        //scrimManagementModalVisible = true;
        //targetId = scrimId;
    };
</script>

<table class="table text-center w-full" >
    <thead>
    <tr>
        <th>Scrim Type</th>
        <th>Game Mode</th>
        <th>Players</th>
        <th/>
        <th>
            <button class="float-right lg:btn-sm btn btn-outline btn-accent" on:click={openCreateScrimModal}>
                Create Scrim
            </button>
        </th>
        <td/>
    </tr>
    </thead>
    <tbody>
    Yo Yo Yo I Am Here
    </tbody>
</table>
<!--{#if createModalVisible}-->
<!--    <CreateScrimModal bind:visible={createModalVisible}/>-->
<!--{/if}-->
<!--{#if joinModalVisible}-->
<!--    <JoinScrimModal scrimId={targetId} bind:visible={joinModalVisible}/>-->
<!--{/if}-->

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
