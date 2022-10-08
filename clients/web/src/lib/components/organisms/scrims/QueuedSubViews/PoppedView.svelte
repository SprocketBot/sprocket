<!--</table>-->
<style lang="postcss">
    h2 {
        @apply text-2xl font-bold text-primary;
    }

    input[type="checkbox"] {
        @apply cursor-default;
    }
</style>

<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import {checkInMutation} from "$lib/api";
    import {Card} from "$lib/components";
    import {user} from "$lib/stores/user";

    export let scrim: CurrentScrim;

    let canCheckIn = true;

    async function checkIn(): Promise<void> {
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

<section>
    <header class="mb-4">
        <h2 class="mb-4">Your scrim popped!</h2>
        <p>
            Everybody needs to check in and you will be presented with your game
            order.
        </p>
    </header>
    <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
        {#each scrim.players as p}
            <Card
                class="bg-base-100/50 transition-colors border {p.checkedIn
                    ? 'border-success/50'
                    : 'border-error/50'}"
            >
                <h2 slot="title">{p.name}</h2>
                <p>
                    Has {#if !p.checkedIn}<strong>not</strong>{/if} checked in.
                </p>

                {#if p.id === $user.userId}
                    <button
                        class="btn btn-accent mr-2"
                        disabled={!canCheckIn}
                        on:click={checkIn}>Check In</button
                    >
                {/if}
            </Card>
        {/each}
    </div>
</section>
<!--<table class="table w-full">-->
<!--    <thead>-->
<!--        <tr>-->
<!--            <th>Player</th>-->
<!--            <th>Checked In</th>-->
<!--            <th class="w-2"></th>-->
<!--        </tr>-->
<!--    </thead>-->
<!--    {#each scrim.players as p}-->
<!--        <tr class="h-20">-->
<!--            <td>{p.name} {p.id === $user.userId ? "(You)" : ""}</td>-->
<!--            <td>-->
<!--                <input type="checkbox" class="toggle" on:click|capture|preventDefault={() => false} checked={Boolean(p.checkedIn)} readonly/>-->
<!--            </td>-->
<!--            <td>-->

<!--            </td>-->
<!--        </tr>-->
<!--    {/each}-->
