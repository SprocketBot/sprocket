<script lang="ts" context="module">
    import type {LoadInput, LoadOutput} from "@sveltejs/kit";

    export const load = ({session}: LoadInput): LoadOutput => {
        console.log(session);
        if (!session.user) {
            return {redirect: "/auth/login", status: 302};
        }
        return {};
    };
</script>

<slot/>