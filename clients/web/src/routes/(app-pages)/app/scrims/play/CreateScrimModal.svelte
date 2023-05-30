<script lang="ts" context="module">
    import {z} from "zod";
    const formInput = z.object({
        gameModeId: z.number(),
        createGroup: z.boolean().default(false),
        leaveAfter: z.number().default(15 * 60),
        canSaveDemos: z.boolean().default(false),
        settings: z.object({
            competitive: z.boolean().default(true),
            observable: z.boolean().default(false),
            mode: z.enum(["ROUND_ROBIN", "TEAMS"]),
        }),
    });
    type FormInput = z.infer<typeof formInput>;
</script>

<script lang="ts">
    import {Alert, Button, Checkbox, Modal, Select} from "$lib/components";
    import {CreateScrimStore, MemberGamesStore} from "$houdini";
    import {onMount} from "svelte";
    import type {SelectOption} from "$lib/components";
    import {invalidateAll} from "$app/navigation";
    export let open = false;

    const memberGames = new MemberGamesStore();
    const createScrim = new CreateScrimStore();

    onMount(() => memberGames.fetch());

    let formValues: Partial<Omit<FormInput, "settings">> & {settings: Partial<FormInput["settings"]>} = {
        settings: {
            competitive: true,
        },
    };

    let gameId: number;
    let games: SelectOption<number>[] = [];
    $: games = $memberGames.data?.getMemberGames.map(g => ({label: g.title, value: g.id})) ?? [];

    let gameModes: SelectOption<number>[] = [];
    $: gameModes =
        $memberGames.data?.getMemberGames
            .find(g => g.id === gameId)
            ?.modes.map(m => ({label: m.description, value: m.id})) ?? [];

    let errors: z.typeToFlattenedError<FormInput>;
    async function submit() {
        const result = formInput.safeParse(formValues);
        if (result.success) {
            await createScrim.mutate({options: result.data});
            invalidateAll();
            open = false;
        } else {
            errors = result.error.formErrors;
        }
    }
</script>

<Modal title="Create Scrim" bind:open>
    <form on:submit={submit} class="flex flex-col gap-4">
        {#if formValues.canSaveDemos}
            <Alert variant="warning" compact dismissible={false}>
                You have agreed to save replays; if you do not, you may be temporarily banned from scrims.
            </Alert>
        {/if}
        {#if formValues.createGroup}
            <Alert variant="info" compact dismissible={false}>
                You have indicated that you would like to start a group. After creating the scrim; you will be given a
                code to share with your friends. They can use that to join the scrim, and if available for the scrim
                type; you will be placed on a team when possible.
            </Alert>
        {/if}

        <Select
            size="sm"
            placeholder={$memberGames.fetching ? "Loading..." : "Game"}
            bind:value={gameId}
            options={games}
            label="Select a Game:"
        />
        <Select
            size="sm"
            placeholder={$memberGames.fetching ? "Loading..." : "Game Mode"}
            disabled={typeof gameId === "undefined"}
            bind:value={formValues.gameModeId}
            options={gameModes}
            label="Select a Game Mode:"
        />
        <Select
            size="sm"
            placeholder="Scrim Format"
            bind:value={formValues.settings.mode}
            options={[
                {label: "Round Robin", value: "ROUND_ROBIN"},
                {label: "Teams", value: "TEAMS"},
            ]}
            label="Select a Format:"
        />
        <Select
            size="sm"
            placeholder="How long to wait before automatically leaving"
            bind:value={formValues.leaveAfter}
            options={[
                {label: "5 minutes", value: 60 * 5},
                {label: "15 minutes", value: 60 * 15},
                {label: "1 hour", value: 60 * 60},
                {label: "2 hours", value: 60 * 60 * 2},
            ]}
            label="Leave After:"
        />
        <Checkbox bind:value={formValues.createGroup} label="I would like to start a group (play with friends)" />
        <Checkbox bind:value={formValues.canSaveDemos} label="I can save replays" />
        <Checkbox bind:value={formValues.settings.competitive} label="Competitive Scrim (impacts salary)" />
        <Checkbox bind:value={formValues.settings.observable} label="Observable (lobby info is available to scouts)" />

        <Button>Create Scrim</Button>
    </form>
</Modal>
