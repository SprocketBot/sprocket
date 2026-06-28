<script lang="ts">
    import {pendingScrims, type PendingScrim} from "$lib/api";
    import {onDestroy, onMount} from "svelte";

    import {
        ScrimCard, ScrimTable, CreateScrimModal, JoinScrimModal, Spinner,
    } from "$lib/components";

    const LOAD_TIMEOUT_MS = 15000;

    interface PendingScrimsResponse {
        pendingScrims?: unknown;
    }

    const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

    const hasValidScrimShape = (value: unknown): value is PendingScrim => {
        if (!isRecord(value)) return false;
        if (typeof value.id !== "string") return false;
        if (typeof value.playerCount !== "number") return false;
        if (typeof value.maxPlayers !== "number") return false;
        if (!isRecord(value.gameMode)) return false;
        if (typeof value.gameMode.description !== "string") return false;
        if (!isRecord(value.gameMode.game)) return false;
        if (typeof value.gameMode.game.title !== "string") return false;
        if (!isRecord(value.settings)) return false;
        if (typeof value.settings.competitive !== "boolean") return false;
        return typeof value.settings.mode === "string";
    };

    const extractScrims = (data: PendingScrimsResponse | undefined): PendingScrim[] | undefined => {
        const value = data?.pendingScrims;
        return Array.isArray(value) && value.every(hasValidScrimShape) ? value : undefined;
    };

    let scrims: PendingScrim[] | undefined;
    $: pendingScrimsData = $pendingScrims.data;
    $: isFetching = Boolean(($pendingScrims as unknown as {fetching?: boolean;}).fetching);
    $: scrims = extractScrims(pendingScrimsData);

    let timedOut = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    onMount(() => {
        timeoutId = setTimeout(() => {
            if (isFetching && !Array.isArray(pendingScrimsData?.pendingScrims)) {
                timedOut = true;
            }
        }, LOAD_TIMEOUT_MS);
    });

    onDestroy(() => {
        if (timeoutId) clearTimeout(timeoutId);
    });

    $: loadError = (() => {
        if ($pendingScrims.error) {
            return $pendingScrims.error.message
                || "The server returned an error while loading available scrims.";
        }
        if (timedOut && scrims === undefined) {
            return "The scrims list is taking longer than expected to load. Please try again.";
        }
        if (!isFetching && scrims === undefined) {
            return "The server response did not include a valid scrims list.";
        }
        return "";
    })();

    let createModalVisible = false;
    let joinModalVisible = false;
    let targetScrim: PendingScrim | undefined;

    const retryLoadScrims = () => {
        timedOut = false;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if (!Array.isArray($pendingScrims.data?.pendingScrims)) {
                timedOut = true;
            }
        }, LOAD_TIMEOUT_MS);
        pendingScrims.invalidate();
    };

    const openCreateScrimModal = () => {
        createModalVisible = true;
    };
    const openJoinScrimModal = (scrim: PendingScrim) => {
        targetScrim = scrim;
        joinModalVisible = true;
    };
</script>



{#if loadError}
    <div class="alert alert-error">
        <div>
            <h3 class="font-bold">Unable to load available scrims</h3>
            <p class="text-sm">{loadError}</p>
        </div>
        <button class="btn btn-outline" on:click={retryLoadScrims}>
            Try again
        </button>
    </div>
{:else if scrims === undefined}
    <div class="h-full w-full flex items-center justify-center">
        <Spinner class="h-16 w-full"/>
    </div>
{:else}
    <div class="flex flex-col md:flex-row justify-between mb-4">
        <h2>Available Scrims</h2>
        <button class="btn btn-primary w-full md:w-auto" on:click={openCreateScrimModal}>
            Create Scrim
        </button>
    </div>

    <div class="flex md:hidden flex-col gap-4">
        {#each scrims as scrim (scrim.id)}
            <ScrimCard {scrim} joinScrim={openJoinScrimModal} />
        {/each}
    </div>
    <div class="hidden md:block">
        <ScrimTable {scrims} joinScrim={openJoinScrimModal} />
    </div>
{/if}

{#if createModalVisible}
    <CreateScrimModal bind:visible={createModalVisible} />
{/if}
{#if joinModalVisible && targetScrim}
    <JoinScrimModal scrim={targetScrim} bind:visible={joinModalVisible} />
{/if}



<style lang="postcss">
    h2 {
        @apply text-4xl font-bold text-sprocket mb-2;
    }
</style>
