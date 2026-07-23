<script lang="ts">
    import {createTestScrimMutation, type GamesAndModesValue} from "$lib/api";
    import {gamesAndModes} from "$lib/api/queries/GamesAndModes.store";
    import {Modal, toasts} from "$lib/components";

    export let visible = false;
    export let onCreated: (submissionId: string) => void;

    let gameModeId: number | undefined;
    let skillGroupId: number | undefined;
    let creating = false;

    $: games = $gamesAndModes?.data?.games ?? [];

    async function create() {
        if (!gameModeId || !skillGroupId) return;
        creating = true;
        try {
            const result = await createTestScrimMutation({gameModeId, skillGroupId});
            const submissionId = result.createTestScrim.submissionId;
            if (!submissionId) throw new Error("Test scrim did not return a submission ID");
            visible = false;
            onCreated(submissionId);
        } catch (error) {
            toasts.pushToast({status: "error", content: error instanceof Error ? error.message : "Failed to create test scrim"});
        } finally {
            creating = false;
        }
    }

    let games: GamesAndModesValue["games"] = [];
</script>

<Modal title="Create Test Scrim" bind:visible id="create-test-scrim-modal">
    <form slot="body" on:submit|preventDefault={create} class="space-y-4">
        <label class="form-control">
            <span class="label-text">Game mode</span>
            <select class="select select-bordered" bind:value={gameModeId} required>
                <option value={undefined} disabled selected>Select a mode</option>
                {#each games as game}
                    <optgroup label={game.title}>
                        {#each game.modes as mode}
                            <option value={mode.id}>{mode.description}</option>
                        {/each}
                    </optgroup>
                {/each}
            </select>
        </label>
        <label class="form-control">
            <span class="label-text">Skill group ID</span>
            <input class="input input-bordered" type="number" min="1" bind:value={skillGroupId} required />
            <span class="text-xs opacity-70">Use the Rocket League skill group for this test.</span>
        </label>
        <button class="btn btn-primary" disabled={creating || !gameModeId || !skillGroupId}>Create and upload replay</button>
    </form>
</Modal>
