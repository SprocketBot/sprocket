<script lang="ts" context="module">
    import {
        AdminScrimTable,
        AdminPlayerTable,
        AdminBanTable,
        DashboardLayout,
        DashboardCard,
    } from "$lib/components";

    import type {Load} from "@sveltejs/kit";
    const MLEDB_ADMIN = 1;

    export const load: Load = ({session}) => {
        if (session.user) {
            const inAdminTeam = session.user.orgTeams.find((s:number) => s === MLEDB_ADMIN)
            if ( inAdminTeam === MLEDB_ADMIN) {
                return {status: 200};
            }
            return {status: 302, redirect: "/scrims"};
        }
        return {status: 302, redirect: "/auth/login"};
    };
</script>

<DashboardLayout>
    <DashboardCard title="" class="col-span-6 xl:col-span-5 row-span-2">
        <h2>Scrim Management</h2>
        <div class=" flex justify-center">
            <AdminScrimTable/>
        </div>
    </DashboardCard>
    <DashboardCard title="" class="col-span-6 xl:col-span-5 row-span-2">
        <h2>Player Management</h2>
        <div class= "flex justify-center">
            <AdminPlayerTable/>
        </div>
    </DashboardCard>
    <DashboardCard title="" class="col-span-6 xl:col-span-5 row-span-2">
        <h2>Ban Management</h2>
        <div class=" flex justify-center">
    <AdminBanTable/>
    </div>
    </DashboardCard>
</DashboardLayout>

<style lang="postcss">

    h2 {
        @apply text-4xl font-bold text-sprocket mb-2;
    }
</style>