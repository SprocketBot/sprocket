<script lang="ts">
	import { graphql } from '$houdini';

	const scrims = graphql(`
		subscription scrims {
			availableScrims {
				scrimId
				participants
			}
		}
	`);
	scrims.listen();
</script>

{#if $scrims?.data !== null && $scrims?.data !== undefined}
	{#each $scrims?.data.availableScrims as scrim}
		ScrimId: {scrim.scrimId}
	{/each}
{/if}
