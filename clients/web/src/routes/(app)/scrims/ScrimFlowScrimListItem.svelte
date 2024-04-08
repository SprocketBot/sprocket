<script lang="ts">
	import { ScrimList_FragmentStore, type ScrimList_Fragment } from '$houdini';

	export let pendingScrim: ScrimList_Fragment;

	const pend = new ScrimList_FragmentStore().get(pendingScrim);
</script>

{#if $pend}
	<div class="flex justify-between">
		<p>{$pend.game.name}</p>
		<p>{$pend.skillGroup.name}</p>
		<p>{$pend.participantCount} / {$pend.gameMode.playerCount}</p>
	</div>
{/if}
