<script lang="ts">
	export let background: 'bg-surface-800' = 'bg-surface-800';
	export let border: 'border-surface-600' = 'border-surface-600';
	export let title: string | undefined = undefined;
	export let grow = false;
</script>

<div class="{background}" class:h-full={grow}>
	<section class="flex flex-col cap-2 border p-4 {border} relative rounded" class:h-full={grow}>
		<header class="
			font-bold px-2 ml-2 absolute -translate-y-1/2 top-0 left-0
			before:absolute before:w-full before:h-1/2 before:bottom-[1px] before:left-0 before:bg-surface-800 before:-z-10
		">
			<slot name="header">
				{title}
			</slot>
		</header>

		<slot />
	</section>
</div>
<!-- 
<style lang="postcss">
	header::after {
		@apply w-full h-1/2 bottom-0 absolute left-0 bg-green-800 ;
		content: 'Woah';
	}
</style> -->