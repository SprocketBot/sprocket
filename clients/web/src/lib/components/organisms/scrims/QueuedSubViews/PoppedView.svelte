<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import {user} from "$lib/stores/user";
    import {checkInMutation} from "$lib/api";

    export let scrim: CurrentScrim;


    let canCheckIn = true;
    async function checkIn() {
        try {
            canCheckIn = false;
            await checkInMutation({
                scrimId: scrim.id,
            });
        } catch (e) {
            console.error(e);
            canCheckIn = true;
        }
    }
    $: canCheckIn = !scrim.players.find(p => p.id === $user.userId)!.checkedIn;
</script>


<h2 class="mb-4">Your scrim popped!</h2>
<p>Everybody needs to check in and you will be presented with your game order.</p>
<table class="table w-full">
    <thead>
        <tr>
            <th>Player</th>
            <th>Checked In</th>
            <th class="w-2"></th>
        </tr>
    </thead>
    {#each scrim.players as p}
        <tr class="h-20">
            <td>{p.name} {p.id === $user.userId ? "(You)" : ""}</td>
            <td>
                <input type="checkbox" class="toggle" on:click|capture|preventDefault={() => false} checked={Boolean(p.checkedIn)} readonly/>
            </td>
            <td>
                {#if p.id === $user.userId}
                    <button class="btn btn-accent mr-2" disabled={!canCheckIn} on:click={checkIn}>Check In</button>
                {/if}
            </td>
        </tr>
    {/each}
</table>


<style lang="postcss">
    h2 {
        @apply text-2xl font-bold text-primary;
    }
    input[type="checkbox"] {
        @apply cursor-default;
    }
</style>
