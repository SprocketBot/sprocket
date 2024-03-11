<script lang="ts">
	import { apiUrl } from '$lib/constants';
	import '../app.postcss';

	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup, initializeStores, Toast } from '@skeletonlabs/skeleton';
	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	console.log(`Using Sprocket API @ ${apiUrl}`)
</script>

<Toast position="br" max={2}  padding="px-4 py-2"/>
<slot />
