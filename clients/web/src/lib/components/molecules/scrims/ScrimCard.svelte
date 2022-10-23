<style lang="postcss">
    table {
        @apply select-none rounded-sm;

        th {
            @apply text-left pr-4;
        }

        tr:not(thead tr):first-child th {
            border-top-left-radius: 0.5rem;
        }
        tr:not(thead tr):last-child th {
            border-bottom-left-radius: 0.5rem;
        }
        tr:not(thead tr):first-child td {
            border-top-right-radius: 0.5rem;
        }
        tr:not(thead tr):last-child td {
            border-bottom-right-radius: 0.5rem;
        }
    }
</style>

<script lang="ts">
    import type {PendingScrim} from "$lib/api";
    import {screamingSnakeToHuman} from "$lib/utils";

    export let scrim: PendingScrim;
    export let joinScrim: (scrim: PendingScrim) => void;
</script>

<div class="bg-gray-800 rounded-xl p-4">
    <div class="flex justify-between items-center mb-2">
        <h2 class="text-primary font-bold">Scrim</h2>
        <button
            class="btn btn-outline btn-sm"
            on:click={() => {
                joinScrim(scrim);
            }}>Join</button
        >
    </div>

    <table class="table table-compact w-full">
        <tr>
            <th>Game</th>
            <td>{scrim.gameMode.game.title}</td>
        </tr>

        <tr>
            <th>Game Mode</th>
            <td>{scrim.gameMode.description}</td>
        </tr>

        <tr>
            <th>Scrim Type</th>
            <td>{screamingSnakeToHuman(scrim.settings.mode)}</td>
        </tr>

        <tr>
            <th>Players</th>
            <td>{scrim.playerCount} / {scrim.maxPlayers}</td>
        </tr>

        <tr>
            <th>Mode</th>
            <td>{scrim.settings.competitive ? "Competitive" : "Casual"}</td>
        </tr>
    </table>
</div>
