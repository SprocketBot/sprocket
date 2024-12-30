<script lang="ts">
	import {
	    CreateLFSScrimModal, DashboardLayout, DashboardCard, ScrimTable, Spinner, UploadReplaysModal
	} from "$lib/components";
	import {
		LFSScrimsStore, type PendingScrim
	} from "$lib/api";

	const store = new LFSScrimsStore();
	let fetching = true;
	let uploading = false;
	let creating = false;
	let submissionId: string = "";
	let scrims: PendingScrim[] | undefined = [];

	$: {
		// @ts-expect-error `fetching` exists on the query store but isn't defined in the type
	    fetching = $store.fetching;
		scrims = $store.data?.LFSScrims;
	}

	const openUploadModal = (scrim: PendingScrim) => {
        submissionId = scrim.id;
        uploading = true;
    };
	
	const openCreateScrimModal = () => {
		creating = true;
	}
</script>

<DashboardLayout>
	<DashboardCard class="col-span-8 row-span-3" title="LFS (Team) Scrims">
		<div class="flex flex-col md:flex-row justify-between mb-4">
			<h2>Available Scrims</h2>
			<button class="btn btn-primary w-full md:w-auto" on:click={openCreateScrimModal}>
				Create LFS Scrim
			</button>
		</div>
		{#if fetching}
			<div class="h-full w-full flex items-center justify-center">
				<Spinner class="h-16 w-full"/>
			</div>
		{:else if scrims}
			<ScrimTable scrims={scrims} lfs={true} joinScrim={(scrim) => openUploadModal(scrim)}/>
		{:else}
			<div class="h-full w-full flex items-center justify-center">
				No scrims found
			</div>
		{/if}
	</DashboardCard>
</DashboardLayout>

<UploadReplaysModal bind:visible={uploading} submissionId={submissionId}/>
<CreateLFSScrimModal bind:visible={creating} />