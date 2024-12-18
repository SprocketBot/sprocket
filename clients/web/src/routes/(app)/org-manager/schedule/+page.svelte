<script lang="ts">
	import SubjectBox from '$lib/components/SubjectBox.svelte';
	import type { PageData } from './$houdini';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import CreateScheduleGroupTypeModal from './CreateScheduleGroupTypeModal.svelte';

	export let data: PageData;

	let { OrgManagerSchedulePage } = data;
	$: ({ OrgManagerSchedulePage } = data);

	const modalStore = getModalStore();
</script>

<SubjectBox title="Debug Box">
	<pre>{JSON.stringify($OrgManagerSchedulePage, null, 2)}</pre>
</SubjectBox>

<SubjectBox title="Schedule Group Types">
	{#each $OrgManagerSchedulePage?.data?.scheduleGroupTypes ?? [] as groupType}
		<!-- TODO: Add edit and delete -->
		- {groupType.name}
	{/each}
	<button
		class="btn btn-sm variant-soft-success"
		on:click={() =>
			modalStore.trigger({
				type: 'component',
				component: { ref: CreateScheduleGroupTypeModal }
			})}
	>
		Create New
	</button>
</SubjectBox>

<SubjectBox title="Schedule Groups">
	<!-- TODO: Tree View? -->
	{#each $OrgManagerSchedulePage?.data?.scheduleGroups ?? [] as group}
		{group.name}
	{/each}
</SubjectBox>
