<script lang="ts">
	import {goto} from "$app/navigation";
	import type {LeagueScheduleFixture} from "../../../api";
	import {FranchiseVsCard} from "../atoms";
	import {VsIcon} from "$lib/components/atoms";

	export let fixture: LeagueScheduleFixture;
	export let hidebutton: boolean = false;
</script>

<section class="w-full flex-1">
	<div class="flex justify-between items-center w-full">
		<FranchiseVsCard profile={fixture.homeFranchise.profile}/>
		<span class="w-1/10"><VsIcon/></span>
		<FranchiseVsCard profile={fixture.awayFranchise.profile}/>
	</div>
	<div class="flex justify-center items-center">
		{#if !hidebutton}
			<button on:click={async () => goto(`/league/${fixture.id}`)} class="btn btn-outline btn-primary btn-sm">Details</button>
		{/if}
	</div>
</section>
