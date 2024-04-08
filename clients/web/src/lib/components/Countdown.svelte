<script lang="ts">
	import { onMount } from 'svelte';

	export let remainingTime: number;

	let t = updateTime(remainingTime);

	$: {
		t = updateTime(remainingTime);
	}
	$: display = formatTime(t);

	function updateTime(input: number) {
		input -= 1;
		if (input <= 0) input = 0;

		return input;
	}

	function formatTime(input: number) {
		const seconds = input % 60;
		const minutes = Math.floor(input / 60);

		let output = '';
		if (minutes) output += `${minutes.toFixed(0).padStart(2, '0')}:`;
		const secondsString = seconds.toFixed(0)
		if (minutes) output += secondsString.padStart(2, '0')
		else output += secondsString
		return output;
	}

	onMount(() => {
		const interval = setInterval(() => {
			t = updateTime(t);
			if (t <= 0) clearInterval(interval);
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

{display}
