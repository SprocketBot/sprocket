<script>
	import {page} from "$app/stores";

	import {
	    DashboardLayout,
	    DashboardCard,
	} from "$lib/components";
</script>

<DashboardLayout>
	<DashboardCard  class="col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-6 row-span-1 md:row-span-3">
		<div class="flex justify-center items-center flex-col h-full gap-4">
			{#if $page.status === 404}
				<h1 class="text-5xl md:text-7xl text-primary font-bold">404</h1>
				<span class="text-xl md:text-3xl">We couldn't find that :(</span>
			{:else}
				<h1 class="text-5xl md:text-7xl text-primary font-bold">{$page.status}</h1>
				<span class="text-xl md:text-3xl">Looks like we couldn't do that right now :(</span>
			{/if}
			<div class="flex flex-col sm:flex-row gap-4">
				<button on:click={() => { window.history.back() }} class="btn btn-primary btn-outline btn-lg w-full sm:w-auto">Go Back</button>
				<button on:click={() => { window.location.reload() }} class="btn btn-primary btn-lg w-full sm:w-auto">Refresh</button>
			</div>
		</div>
	</DashboardCard>
</DashboardLayout>
