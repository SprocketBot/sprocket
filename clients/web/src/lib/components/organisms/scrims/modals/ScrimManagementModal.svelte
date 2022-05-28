<script lang="ts">
    /*

     */

    import type {GamesAndModesValue} from "$lib/api";
    import {createScrimMutation} from "$lib/api";
    import {gamesAndModes} from "$lib/api/queries/GamesAndModes.store";
    import {Modal} from "$lib/components";

    export let visible = false;

    let game: GamesAndModesValue["games"][0];
    let mode: GamesAndModesValue["games"][0]["modes"][0];
    let scrimType: "BEST_OF" | "ROUND_ROBIN";
    let competitive: boolean = true;
    let observable: boolean = true;

    let buttonEnabled = true;

    // async function createScrim() {
    //     buttonEnabled = false;
    //     try {
    //         await createScrimMutation({
    //             settings: {
    //                 gameModeId: mode.id,
    //                 mode: scrimType,
    //                 competitive: competitive,
    //                 observable: observable,
    //             },
    //         });
    //         visible = false;
    //     } finally {
    //         buttonEnabled = true;
    //     }
    // }
</script>

<Modal title="Create Scrim" bind:visible id="create-scrim-modal">
    <form on:submit|preventDefault={createScrim} slot="body">
        <div class="divider"></div>


        <div class="form-control">
            <label class="label" for="game">
                <span class="label-text">Game:</span>
            </label>
            <select
                    name="game"
                    bind:value={game}
            >
                <option disabled selected> Make a Selection</option>
                {#each $gamesAndModes?.data?.games ?? [] as g (g.id)}
                    <option value={g}>{g.title}</option>
                {/each}
            </select>
        </div>

        <div class="form-control">
            <label class="label" for="game-mode">
                <span class="label-text">Game Mode:</span>
            </label>
            <select name="game-mode" bind:value={mode}>
                <option disabled selected> Make a Selection</option>
                {#each game?.modes ?? [] as g (g.id)}
                    <option value={g}>{g.description}</option>
                {/each}
            </select>
        </div>

        <div class="divider"></div>


        <div class="form-control">
            <label class="label" for="scrim-type">
                <span class="label-text">Scrim Type:</span>
            </label>
            <select name="scrim-type" bind:value={scrimType}>
                <option disabled selected> Make a Selection</option>
                <option value="BEST_OF"> Best Of</option>
                <option value="ROUND_ROBIN">Round Robin</option>
            </select>
        </div>

        <div class="form-control">
            <label class="label" for="createGroup">
                <span class="label-text">Create Group:</span>
            </label>
            <select disabled name="createGroup">
                <option disabled selected> Coming Soon</option>
            </select>
        </div>


        <div class="form-control">
            <label class="cursor-pointer label" for="competitive">
                <span class="label-text">Competitive</span>
                <input
                        type="checkbox"
                        bind:checked={competitive}
                        class="toggle toggle-primary"
                        name="competitive"
                />
            </label>
        </div>
        <div class="form-control">
            <label class="cursor-pointer label" for="observable">
                <span class="label-text">Observable</span>
                <input
                        type="checkbox"
                        bind:checked={observable}
                        class="toggle toggle-primary"
                        name="observable"
                />
            </label>
        </div>


        <div class="divider"></div>

        <button class="btn btn-primary btn-wide flex mx-auto mb-4" disabled={!buttonEnabled}>Create</button>
    </form>
</Modal>

<style lang="postcss">
    form {
        @apply space-y-4;

    hr {
        @apply col-span-2;
    }

    label {
        @apply contents;
    }

    select {
        @apply mt-2 outline-1 select select-bordered select-sm;

    option {
        @apply py-2;
    }

    &:disabled {
         @apply bg-gray-700 cursor-not-allowed;
     }
    }

    input {
        @apply ml-auto;
    }

    input:disabled {
        @apply text-right px-4 py-1 bg-gray-700;
    }
    }
</style>
