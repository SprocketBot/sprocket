<script lang="ts">
    import {type GamesAndModesValue, createLFSScrimMutation} from "$lib/api";
    import {gamesAndModes} from "$lib/api/queries/GamesAndModes.store";
    import {Modal} from "$lib/components";

    export let visible = false;
    export let lfs = false;

    let game: GamesAndModesValue["games"][0];
    let mode: GamesAndModesValue["games"][0]["modes"][0];
    let scrimType: "TEAMS" | "ROUND_ROBIN";
    let leaveAfter: number = 1800;
    let competitive: boolean = true;
    let createGroup: boolean = false;
    let numRounds: number = 0;
    let buttonEnabled = true;

    async function createScrim() {
        buttonEnabled = false;
        try {
            console.log("Creating scrim:");
            console.log(`Mode: ${scrimType}, Competitive: ${competitive}, LFS: ${lfs}`);
            const data = {
                settings: {
                    mode: "TEAMS",
                    competitive: competitive,
                    observable: false,
                    lfs: true,
                },
                gameModeId: mode.id,
                createGroup: createGroup,
                leaveAfter: leaveAfter,
                numRounds: numRounds,
            };
            await createLFSScrimMutation(data)
            visible = false;
        } finally {
            buttonEnabled = true;
        }
    }
</script>

<Modal title="Create LFS (Team) Scrim" bind:visible id="create-scrim-modal">
    <form on:submit|preventDefault={createScrim} slot="body">
        <div class="divider my-1"></div>

        <div class="form-control">
            <label class="label" for="game">
                <span class="label-text">Game:</span>
            </label>
            <select
                    name="game"
                    bind:value={game}
            >
                <option disabled selected>Make a selection</option>
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
                <option disabled selected>Make a selection</option>
                {#each game?.modes ?? [] as g (g.id)}
                    <option value={g}>{g.description}</option>
                {/each}
            </select>
        </div>

        <div class="form-control">
            <label class="label" for="scrim-type">
                <span class="label-text">Number of Games:</span>
            </label>
            <input type="number" name="num-rounds" bind:value={numRounds} />
        </div>

        <div class="form-control">
            <label class="label" for="scrim-leave-after">
                <span class="label-text">Leave After:</span>
            </label>
            <select name="scrim-leave-after" bind:value={leaveAfter}>
                <option value={1800} selected>30 Minutes</option>
                <option value={3600}>1 Hour</option>
                <option value={10800}>3 Hours</option>
                <option value={21600}>6 Hours</option>
            </select>
        </div>

        <div class="form-control inline">
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

        <button class="btn btn-primary btn-wide flex mx-auto mb-4" disabled={!buttonEnabled}>Create</button>
    </form>
</Modal>

<style lang="postcss">
    form {
        @apply flex flex-col gap-2 md:gap-4;

        .form-control.inline {
            @apply flex flex-row justify-between items-center py-2;
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
