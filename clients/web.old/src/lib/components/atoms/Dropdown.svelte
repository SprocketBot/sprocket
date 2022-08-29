<script lang="ts">
	export let items: Array<{
	    label: string;
	    action: CallableFunction;
	}> = [];
	let _class: string = "";
	export {_class as class};

</script>

<div class="dropdown {_class}">
	<slot name="handle">
		<label tabindex="0" class="btn m-1">Click</label>
	</slot>

	<ul tabindex="0" class="dropdown-content menu p-2 mt-2 shadow bg-base-100 rounded-box w-52">
		{#each items as item}
			<li><button on:click={item.action}>{item.label}</button></li>
		{/each}
	</ul>
</div>
