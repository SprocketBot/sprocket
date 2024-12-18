<script lang="ts">
	import AccountsTable from '$lib/components/AccountsTable.svelte';
	import SubjectBox from '$lib/components/SubjectBox.svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { PageData } from './$houdini';
	import UserAccountModal from './UserAccountModal.svelte';
	import DashboardSection from '../../../lib/components/DashboardSection.svelte';
	import { differenceInCalendarDays } from 'date-fns/differenceInCalendarDays';
	export let data: PageData;
	let { UserSettingsRoot } = data;
	$: ({ UserSettingsRoot } = data);

	const modalStore = getModalStore();
</script>

<DashboardSection transparent size="fill">
	<h2 class="text-lg font-bold">User Settings</h2>
</DashboardSection>

<DashboardSection title="User Information">
	<h3 class="font-bold">Username</h3>
	{$UserSettingsRoot.data?.whoami.username}

	<h3 class="font-bold">Join Date</h3>
	{#if $UserSettingsRoot.data?.whoami}
		{$UserSettingsRoot.data?.whoami.createdAt.toDateString()} ({differenceInCalendarDays(
			new Date(),
			$UserSettingsRoot.data?.whoami.createdAt
		)} days ago)
	{/if}
</DashboardSection>
<DashboardSection title="Account Management" size="large">
	{#if $UserSettingsRoot.data}
		<AccountsTable accts={$UserSettingsRoot.data.whoami} />
		<button
			on:click={() =>
				modalStore.trigger({
					type: 'component',
					component: { ref: UserAccountModal },
					response(r) {
						console.log({ r });
						UserSettingsRoot.fetch();
					}
				})}
			class="variant-filled-primary w-fit px-2 py-1 mt-2 mx-auto">Report a new Account</button
		>
	{/if}
</DashboardSection>
