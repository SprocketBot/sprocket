<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const { okay } = data;

	onMount(() => {
		const interval = setInterval(async () => {
			console.log('tick!');
			if (await okay()) {
				window.history.back();
				clearInterval(interval);
				console.log('Api is back online!')
			}
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

Oops! Looks like the API is unreachable. This should resolve itself soon. You will be sent back to
the page you were on when we are back!
<!-- 
    TODO: Poll the API for a successful response, then hit 'em with the browser back to send them back to wherever they were
    along with a toast that says "back online" or similar
-->