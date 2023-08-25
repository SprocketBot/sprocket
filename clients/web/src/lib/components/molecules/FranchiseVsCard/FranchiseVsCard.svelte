<script lang="ts">
	import type {LeagueScheduleFranchise} from "$lib/api";
	import Color from "color";
	export let profile: LeagueScheduleFranchise;


	// Use whichever color has a higher luminosity
	let applicableFontVar = "";
	const primary = new Color(profile.primaryColor);
	const secondary = new Color(profile.secondaryColor);
	$: applicableFontVar = primary.luminosity() > secondary.luminosity() ? profile.primaryColor : profile.secondaryColor;
	
</script>


<div class="flex-1 flex-col items-center gap-2" style="--primary-color: {profile.primaryColor}; --secondary-color: {profile.secondaryColor}">
	<div class="aspect-square rounded-full w-16 h-16 p-2 mx-auto
	bg-gradient-to-br from-context-primary to-context-secondary flex
	justify-center items-center">
		<img class="max-w-full max-h-full"  src={profile.photo?.url} alt={profile.title}/>
	</div>
	<span class="block text-xl font-bold text-center" style="color:
	{applicableFontVar}">{profile.title}</span>
</div>

<style lang="postcss">
	span {
		position: relative;
	}

	span::before {
		content: "";
		position: absolute;
		top: 100%;
		width: 100%;
		left: 0;
		height: 5px;
		border-radius: 2px;
		background: linear-gradient(111.3deg, var(--primary-color), var(--secondary-color));
	}
</style>