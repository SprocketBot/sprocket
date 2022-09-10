<script lang="ts">
    import GameFeatureToggle from "./GameFeatureToggle.svelte";
    import { GameFeatureStore } from "$lib/api";
    import { FeatureCode } from "$lib/api/queries/game-features/feature.types";
    import { setGameFeatureMutation } from "$lib/api/queries/game-features/SetGameFeature.mutation";

    const ROCKET_LEAGUE_GAME_ID = 2;

    let rankoutsLoading = false;
    const rankoutsEnabledStore = new GameFeatureStore({code: FeatureCode.AUTO_RANKOUTS, gameId: ROCKET_LEAGUE_GAME_ID})
    let rankoutsEnabled: boolean | undefined;
    $: rankoutsEnabled = $rankoutsEnabledStore.data?.getFeatureEnabled;

    const toggleRankouts = async () => {
        rankoutsLoading = true;
        await setGameFeatureMutation({
            code: FeatureCode.AUTO_RANKOUTS,
            gameId: ROCKET_LEAGUE_GAME_ID,
            value: !rankoutsEnabled,
        })
        rankoutsEnabledStore.invalidate();
        rankoutsLoading = false;
    }
</script>


<div>
    <!-- <GameFeatureToggle label="Scrims" value={undefined} on:change={() => { console.log("scrims") }} /> -->
    <GameFeatureToggle label="Rankouts" value={rankoutsEnabled} loading={rankoutsLoading} on:toggle={toggleRankouts} />
</div>
