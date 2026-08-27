<script lang="ts" context="module">
    import {
        AdminBanTable,
        AdminPlayerTable,
        AdminScrimTable,
        AdminSettings,
        AdminSubmissionTable,
        AdminSessionManagement,
        DashboardCard,
        DashboardLayout,
    } from "$lib/components";

    import type {Load} from "@sveltejs/kit";

    const MLEDB_ADMIN = 0;

    export const load: Load = ({session}) => {
        if (session.user) {
            if (session.user.orgTeams.some(s => s === MLEDB_ADMIN)) {
                return {status: 200};
            }
            return {status: 302, redirect: "/scrims"};
        }
        return {status: 302, redirect: "/auth/login"};
    };
</script>

<DashboardLayout>
    <DashboardCard
        title="Admin Settings"
        class="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5 row-span-1 md:row-span-2"
    >
        <div class=" flex justify-center">
            <AdminSettings />
        </div>
    </DashboardCard>
    <DashboardCard
        title="Scrim Management"
        class="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5 row-span-1 md:row-span-2"
    >
        <div class=" flex justify-center">
            <AdminScrimTable />
        </div>
    </DashboardCard>
    <DashboardCard
        title="Submission Management"
        class="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5 row-span-1 md:row-span-2"
    >
        <div class=" flex justify-center">
            <AdminSubmissionTable />
        </div>
    </DashboardCard>
    <DashboardCard
        title="Player Management"
        class="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5 row-span-1 md:row-span-2"
    >
        <div class="flex justify-center">
            <AdminPlayerTable />
        </div>
    </DashboardCard>
    <DashboardCard
        title="Ban Management"
        class="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5 row-span-1 md:row-span-2"
    >
        <div class=" flex justify-center">
            <AdminBanTable />
        </div>
    </DashboardCard>
    <DashboardCard
        title="Session Management"
        class="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5 row-span-1 md:row-span-2"
    >
        <div class=" flex justify-center">
            <AdminSessionManagement />
        </div>
    </DashboardCard>
</DashboardLayout>
