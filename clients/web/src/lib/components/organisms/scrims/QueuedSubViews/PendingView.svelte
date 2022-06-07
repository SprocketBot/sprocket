<script lang="ts">
    import type {CurrentScrim} from "$lib/api";
    import {currentScrim, leaveScrimMutation} from "$lib/api";
    import {ScrimFullIndicator} from "$lib/components";
    import {screamingSnakeToHuman} from "$lib/utils";
    import {user} from "$lib/stores/user";

    export let scrim: CurrentScrim;


    let leaveButtonEnabled = true;

    async function abandon() {
        leaveButtonEnabled = false;
        try {
            await leaveScrimMutation({
                player: {id: $user.id, name: $user.name},
                scrimId: $currentScrim.data.currentScrim.id,
            });
        } finally {
            leaveButtonEnabled = true;
        }
    }
</script>

<section class="w-full h-full flex justify-between flex-col">
    <div>
        <div class="flex justify-between w-full mb-4">
            <h2>You are currently queued!</h2>
            <button class="btn btn-error btn-outline lg:btn-sm" disabled={!leaveButtonEnabled} on:click={abandon}>Leave
                Scrim
            </button>
        </div>
        <div class="w-full mb-4">
            <h3>Scrim Details:</h3>
            <dl>
                <dt>Scrim Type:</dt>
                <dd>{screamingSnakeToHuman(scrim.settings.mode)}</dd>
                <dt>Game Mode:</dt>
                <dd>{scrim.gameMode.description}</dd>
            </dl>
        </div>
        {#if scrim.currentGroup}
        <div class='w-full'>
            <h3>You are currently in a group</h3>
            <div class='flex gap-4 items-center'>
                <p>Share this code with your friends so they can join your group</p>
                <span class='inline-block px-4 py-2 text-2xl text-primary/80 bg-base-200/60 rounded-lg'>{scrim.currentGroup.code}</span>
            </div>
            <div>
                <p>Other players in your group:</p>
                {#each scrim.currentGroup.players as p}
                    <p>{p}</p>
                {/each}
            </div>

        </div>
        {/if}
    </div>

    <ScrimFullIndicator/>
</section>


<style lang="postcss">
    h2 {
        @apply text-2xl font-bold text-primary;
    }
    h3 {
        @apply italic text-opacity-80 text-xl;
    }


    dl {
        @apply text-lg lg:text-base;

        dt {
            @apply font-bold mr-2;
        }

        dd {

        }

    }
</style>
