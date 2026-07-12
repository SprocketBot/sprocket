<script lang='ts'>
	import {slide} from "svelte/transition";
	import FaChevronDown from "svelte-icons/fa/FaChevronDown.svelte";
	import FaChevronUp from "svelte-icons/fa/FaChevronUp.svelte";

	export let title: string;
	export let open: boolean = false;
</script>
<div class="bg-base-300/20 px-4 py-4 rounded-lg space-y-4">
	<button
		type="button"
		class='flex justify-between items-center cursor-pointer select-none w-full text-left'
		on:click={() => { open = !open }}
		aria-expanded={open}
	>
		<span class='text-xl font-bold'>{title}</span>
		<span class='h-6'>
		{#if open} <FaChevronDown /> {:else} <FaChevronUp /> {/if}
	</span>
	</button>
	{#if open}
		<div transition:slide>
			<slot />
		</div>
	{/if}
</div>
