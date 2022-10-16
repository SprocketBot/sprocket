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

<script lang="ts">
    import type {PendingScrim} from "$lib/api";
    import {screamingSnakeToHuman} from "$lib/utils";
    import type {PendingScrim} from "$lib/api";
    import {format} from "date-fns";
    import dateFns from "date-fns-tz";
    const {utcToZonedTime} = dateFns;

    export let scrims: PendingScrim[];
    export let joinScrim: (scrim: PendingScrim) => void;
</script>

<table class="table text-center w-full">
    <thead>
    <tr>
        <th>Game</th>
        <th>Skill Group</th>
        <th>Game Mode</th>
        <th>Scrim Type</th>
        <th>Players</th>
        <th>Mode</th>
        <th>Created At</th>
        <th />
    </tr>
    </thead>
    <tbody>
    {#each scrims as scrim (scrim.id)}
        <tr>
            <td>{scrim.gameMode.game.title}</td>
            <td>{scrim.settings.competitive ? scrim.skillGroup?.profile?.description : ""}</td>
            <td>{scrim.gameMode.description}</td>
            <td>{screamingSnakeToHuman(scrim.settings.mode)}</td>
            <td>{scrim.playerCount} / {scrim.maxPlayers}</td>
            <td>{scrim.settings.competitive ? "Competitive" : "Casual"}</td>
            <td>{format(utcToZonedTime(new Date(scrim.createdAt), "America/New_York"), "MM'/'d h:mmaaa 'ET")}</td>
            <td>
                <button on:click={() => { joinScrim(scrim) }} class="btn btn-outline float-right lg:btn-sm">
                    Join
                </button>
            </td>
        </tr>
    {/each}
    </tbody>
</table>
