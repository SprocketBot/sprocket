<script lang="ts">
	import {goto} from "$app/navigation";
	import {VsIcon} from "$lib/components/atoms";
	
	import type {LeagueScheduleFixture} from "../../../api";
	import {FranchiseVsCard} from "../atoms";

	export let fixture: LeagueScheduleFixture;
	export let hidebutton = false;
</script>


<section class="w-80 flex flex-col items-center gap-4 bg-gray-700 p-4 rounded-xl">
	<div class="flex flex-row items-center gap-4 w-full">
		<FranchiseVsCard profile={fixture.homeFranchise.profile}/>
		<span class="w-6 flex-shrink-0"><VsIcon/></span>
		<FranchiseVsCard profile={fixture.awayFranchise.profile}/>
	</div>
	{#if !hidebutton}
		<div class="flex justify-center items-center">
			<button on:click={async () => goto(`/league/${fixture.id}`)} class="btn btn-outline btn-primary btn-sm">Details</button>
		</div>
	{/if}
</section>
