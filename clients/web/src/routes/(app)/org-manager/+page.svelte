<script lang="ts">
	import DashboardSection from "$lib/components/DashboardSection.svelte";
    import type { PageData } from './$houdini';
    
    export let data: PageData
    console.log(data)
    $: console.log(data)
    let {OrgManagerDashboard} = data;
    $: ({OrgManagerDashboard} = data);


    let {metrics} = $OrgManagerDashboard.data ?? {};
    $: ({metrics} = $OrgManagerDashboard.data ?? {metrics: undefined});
</script>

<DashboardSection size="large" transparent>
    <h1 class="text-3xl text-primary-500 font-bold">Organization Manager</h1>
</DashboardSection>

<DashboardSection title="Membership Metrics">
    <h3 class="font-bold">Active Users</h3>
    {metrics?.activeUserCount}
    
    <h3 class="font-bold">Total Users</h3>
    {metrics?.userCount}

    <h3 class="font-bold">Player Registrations</h3>
    {metrics?.playerCount}

</DashboardSection>