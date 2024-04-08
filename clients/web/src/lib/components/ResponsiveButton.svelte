<script lang="ts">
	import { Icon, type IconSource } from '@steeze-ui/svelte-icon';

	export let spacing: 'tight' | 'base' | 'wide' = 'base';

	let _class: string = '';
	export { _class as class };
	export let src: IconSource;
</script>

<button
	class="btn btn-sm flex {_class}"
	on:click
	class:gap-1={spacing === 'tight'}
	class:gap-2={spacing === 'base'}
	class:gap-4={spacing === 'wide'}
>
	<Icon {src} class="w-4" />
	<span class="hidden lg:inline"><slot /></span>
</button>
