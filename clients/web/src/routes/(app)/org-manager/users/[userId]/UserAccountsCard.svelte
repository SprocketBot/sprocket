<script lang="ts">
	import {
		type Fragment_UserAccounts
	} from'$houdini';
	import SubjectBox from '$lib/components/SubjectBox.svelte';
	import AccountsTable from '$lib/components/AccountsTable.svelte';
	import DashboardSection from '$lib/components/DashboardSection.svelte';

	export let accts: Fragment_UserAccounts;
</script>

<DashboardSection title="Reported User Accounts">
	<AccountsTable accts={accts} />
</DashboardSection>
