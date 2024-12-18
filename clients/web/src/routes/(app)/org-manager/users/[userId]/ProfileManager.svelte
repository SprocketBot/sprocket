<script lang="ts">
	import SubjectBox from '$lib/components/SubjectBox.svelte';

	export let userData: { username: string };
</script>

<label class="label">
	Username
	<input value={userData.username} class="input" />
</label>
