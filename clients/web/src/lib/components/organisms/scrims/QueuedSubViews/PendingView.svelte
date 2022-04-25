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
        <div class="w-full">
            <p class="italics text-opacity-80 text-lg">Details:</p>
            <dl>
                <dt>Scrim Type:</dt>
                <dd>{screamingSnakeToHuman(scrim.settings.mode)}</dd>
                <dt>Game Mode:</dt>
                <dd>{scrim.gameMode.description}</dd>
            </dl>
        </div>
    </div>

    <ScrimFullIndicator/>
</section>


<style lang="postcss">
    h2 {
        @apply text-2xl font-bold text-primary;
    }

    dl {
        @apply text-lg lg:text-base;

        dt {
            @apply font-bold float-left clear-both mr-2;
        }

        dd {
            @apply float-left;
        }

    }
</style>