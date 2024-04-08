<script lang="ts">
	import { ScrimList_FragmentStore, type ScrimList_Fragment } from '$houdini';
	import SubjectBox from '$lib/components/SubjectBox.svelte';

	export let pendingScrim: ScrimList_Fragment;

	const scrim = new ScrimList_FragmentStore().get(pendingScrim);
</script>

{#if $scrim}
	<SubjectBox title="{$scrim.game.name} {$scrim.gameMode.name}">
		<p>Current Participants: {$scrim.participantCount} / {$scrim.gameMode.playerCount}</p>
		<p>State: {$scrim.state}</p>
	</SubjectBox>
	<div>
		<p>ScrimId: {$scrim.id}</p>
		<p>ParticipantCount: {$scrim.participantCount}</p>
		<p>ParticipantCount: {$scrim.participantCount}</p>
	</div>
{/if}
