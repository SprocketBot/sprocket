<script lang="ts" context="module">
    import type {Load} from "@sveltejs/kit";

    export const load: Load = ({session}) => {
        if (!session.user) {
            return {redirect: "/auth/login", status: 302};
        }
        if (!session.user.orgTeams.some(s => s === 0)) {
            return {redirect: "/scrims", status: 302};
        }
        return {};
    };
</script>

<slot/>
