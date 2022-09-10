<script lang="ts">
    import GameFeatureToggle from "./GameFeatureToggle.svelte";
</script>


<div>
    <GameFeatureToggle label="Scrims" value={false} loading on:change={() => { console.log("scrims") }} />
    <GameFeatureToggle label="Rankouts" value={true} loading on:change={() => { console.log("rankouts") }} />
</div>
