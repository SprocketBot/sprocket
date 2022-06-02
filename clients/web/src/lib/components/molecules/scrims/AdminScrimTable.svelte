<script lang="ts">
    import {ScrimManagementModal} from "$lib/components";
    import {screamingSnakeToHuman} from "$lib/utils";
    import {AllCurrentScrimsQuery} from "$lib/api";
    import {client} from "$lib/api/client";
    import { activeScrims, type ActiveScrims } from "../../../api/queries/ActiveScrims.store";
    import type {CurrentScrim} from "../../../api/queries/CurrentScrim.store";

    /*
    This will be the table that shows in ScrimManagementModal (Currently Named Modal
    but I have since realized that it not the greatest)

    TODO: Populate all scrims list
    TODO: Create/Implement Search
    TODO: Figure out Visibility status pattern from CreateScrimModal and Scrim Table

     */

    //export let adminScrimsInTable = [
    //   {
    //       "id":1,
    //       "status": 'Pending',
    //       "gameMode": {
    //           "description": "Doubles",
    //       },
    //       "playerCount": 4,
    //       "maxPlayers": 4,
    //       "settings": {
    //           "competitive": true,
    //           "mode": "DOUBLES"
    //       }
    //   }
    //];
    //console.log(adminScrimsInTable);
    export let visible = false;
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

    let activeScrimsData: ActiveScrims | undefined;
    $: activeScrimsData = $activeScrims?.data?.activeScrims;
</script>

<table class="table text-center w-full" >
    <thead>
    <tr>
        <th>Scrim ID</th>
        <th>Game Mode</th>
        <th>Status</th>
        <th>Players</th>
        <th>
            <button class="float-right btn btn-outline btn-accent" on:click={lockAllScrims}>
                <img src = {lockimgsrc} alt= {lockimgalt} >
            </button>
        </th>
    </tr>
    </thead>
    <tbody>
    {#if activeScrimsData?.length}
        {#each activeScrimsData as scrim (scrim.id)}
            <tr>
                <td>{scrim.id}</td>
                <td>{screamingSnakeToHuman(scrim.settings.mode)}</td>
                <td>{scrim.status}</td>
                <!--{#if scrim.players.length >= 1}-->
                <!--    <td>{scrim.players.join(", ")}</td>-->
                <!--    {:else}-->
                <!--    <td>Empty Scrim</td>-->
                <!--{/if}-->
                <td>
                    <button on:click={() => { openScrimManagementModal(scrim.id) }} class="btn btn-outline float-right lg:btn-sm">
                        Manage
                    </button>
                </td>
            </tr>
        {/each}
    {/if}

    </tbody>
</table>
{#if scrimManagementModalVisible}
    <ScrimManagementModal bind:visible={scrimManagementModalVisible}/>
{/if}