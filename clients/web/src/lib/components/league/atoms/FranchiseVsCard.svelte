<script lang="ts">
	import type {LeagueScheduleFranchise} from "../../../api";
	import Color from "color";
	export let profile: LeagueScheduleFranchise;


	const primary = new Color(profile.primaryColor);
	let applicableFontVar = "";
	$: applicableFontVar = primary.luminosity() > 0.1 ? "text-context-primary" : "text-context-secondary";

</script>


<div class="flex-1 flex-col items-center gap-2" style="--primary-color: {profile.primaryColor}; --secondary-color: {profile.secondaryColor}">
	<div class="aspect-square rounded-full w-1/2 p-2 mx-auto bg-gradient-to-br from-context-primary to-context-secondary flex justify-center items-center">
		<img class="max-w-full max-h-full "  src={profile.photo?.url} alt={profile.title}/>
	</div>
	<span class="block text-xl { applicableFontVar } font-bold text-center">{profile.title}</span>
</div>
