<script lang="ts">
    import GameFeatureToggle from "./GameFeatureToggle.svelte";
    import {
        GameFeatureStore, FeatureCode, setGameFeatureMutation, scrimsDisabled, setScrimsDisabledMutation,
    } from "$lib/api";

    const ROCKET_LEAGUE_GAME_ID = 7;

    // =================================
    // State
    // =================================
    let scrimsLoading = false;
    let scrimsEnabled: boolean | undefined;
    $: scrimsEnabled = $scrimsDisabled.data ? !$scrimsDisabled.data.getScrimsDisabled : undefined;
    
    let rankoutsLoading = false;
    const rankoutsEnabledStore = new GameFeatureStore({code: FeatureCode.AUTO_RANKOUTS, gameId: ROCKET_LEAGUE_GAME_ID});
    let rankoutsEnabled: boolean | undefined;
    $: rankoutsEnabled = $rankoutsEnabledStore.data?.getFeatureEnabled;
    
    // =================================
    // Handlers
    // =================================
    const toggleScrims = async () => {
        scrimsLoading = true;
        const newValue = Boolean(scrimsEnabled);
        try {
            if (window.confirm(`Are you sure you want to ${newValue ? "DISABLE" : "ENABLE"} scrims?`)) {
                await setScrimsDisabledMutation({disabled: newValue});
            }
        } catch (e) {
            console.log("Failed to toggle scrims");
        } finally {
            scrimsLoading = false;
        }
    };

    const toggleRankouts = async () => {
        rankoutsLoading = true;
        const newValue = !rankoutsEnabled;
        try {
            if (window.confirm(`Are you sure you want to ${newValue ? "ENABLE" : "DISABLE"} rankouts?`)) {
                await setGameFeatureMutation({
                    code: FeatureCode.AUTO_RANKOUTS,
                    gameId: ROCKET_LEAGUE_GAME_ID,
                    value: newValue,
                });
            }
        } catch (e) {
            console.log("Failed to toggle rankouts", e);
        }
        rankoutsEnabledStore.invalidate();
        rankoutsLoading = false;
    };
</script>


<div>
    <GameFeatureToggle label="Scrims" value={scrimsEnabled} loading={scrimsLoading} on:toggle={toggleScrims} />
    <GameFeatureToggle label="Rankouts" value={rankoutsEnabled} loading={rankoutsLoading} on:toggle={toggleRankouts} />
</div>
