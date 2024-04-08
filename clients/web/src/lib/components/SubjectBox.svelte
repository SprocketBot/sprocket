<script lang="ts">
	export let background: 'bg-surface-800' = 'bg-surface-800';
	export let border: 'border-surface-600' = 'border-surface-600';
	export let title: string;
</script>

<div class="{background} my-4">
	<section class="flex flex-col cap-2 border p-4 {border} relative">
		<header class="font-bold px-2 absolute -translate-y-1/2 top-0 left-4 {background}">
			<slot name="header">
				{title}
			</slot>
		</header>

		<slot />
	</section>
</div>
