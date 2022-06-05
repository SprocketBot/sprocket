<script lang="ts" context="module">
    import {
        AdminBanTable, AdminPlayerTable, AdminScrimTable, DashboardCard, DashboardLayout,
    } from "$lib/components";

    import type {Load} from "@sveltejs/kit";

    const MLEDB_ADMIN = 0;

    export const load: Load = ({session}) => {
        if (session.user) {
            const inAdminTeam = session.user.orgTeams.find((s: number) => s === MLEDB_ADMIN);
            if (inAdminTeam === MLEDB_ADMIN) {
                return {status: 200};
            }
            return {status: 302, redirect: "/scrims"};
        }
        return {status: 302, redirect: "/auth/login"};
    };
</script>

<DashboardLayout>
    <DashboardCard title="Scrim Management" class="col-span-6 xl:col-span-5 row-span-2">
        <div class=" flex justify-center">
            <AdminScrimTable/>
        </div>
    </DashboardCard>
    <DashboardCard title="Player Management" class="col-span-6 xl:col-span-5 row-span-2">
        <div class="flex justify-center">
            <AdminPlayerTable/>
        </div>
    </DashboardCard>
    <DashboardCard title="Ban Management" class="col-span-6 xl:col-span-5 row-span-2">
        <div class=" flex justify-center">
            <AdminBanTable/>
        </div>
    </DashboardCard>
</DashboardLayout>
