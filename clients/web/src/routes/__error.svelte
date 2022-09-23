<script>
	import {page} from "$app/stores";

	import {
	    DashboardLayout,
	    DashboardCard,
	    SprocketBot,
	} from "$lib/components";
</script>

<DashboardLayout>
	<DashboardCard title="" class="col-span-6 row-span-3">
		<div class="flex flex-col justify-evenly items-center h-full gap-4">

			<div class="flex flex-col items-center justify-center">
				<h1 class="text-7xl text-primary font-bold">{$page.status}</h1>
				<SprocketBot class="h-64" />
			</div>

			<div class="flex flex-col items-center justify-center gap-4">
				<span class="text-3xl">
					{#if $page.status === 404}
						We couldn't find that :(
					{:else}
						Looks like we couldn't do that right now :(
					{/if}
				</span>
	
				<div class="flex gap-4">
					<button on:click={() => { window.history.back() }} class="btn btn-primary btn-outline btn-md">Go Back</button>
					<button on:click={() => { window.location.reload() }} class="btn btn-primary btn-md">Refresh</button>
				</div>
			</div>
		</div>
	</DashboardCard>
</DashboardLayout>
