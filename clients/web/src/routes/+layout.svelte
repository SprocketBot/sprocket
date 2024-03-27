<script lang="ts">
	import { apiUrl } from '$lib/constants';
	import '../app.postcss';

	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import {
		storePopup,
		initializeStores,
		Toast,
		Modal,
		getToastStore
	} from '@skeletonlabs/skeleton';
	import { setToastStore } from '../client';
	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	console.log(`Using Sprocket API @ ${apiUrl}`);

	setToastStore(getToastStore());
</script>

<Toast position="br" max={2} padding="px-4 py-2" />
<Modal />
<slot />
