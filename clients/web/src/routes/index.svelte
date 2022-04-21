<script lang="ts" context="module">
import type {LoadInput, LoadOutput} from "@sveltejs/kit";

    export function load({session}: LoadInput): LoadOutput {
        if (session.user) {
            return {status: 302, redirect: "/scrims/queue"};
        }
        return {status: 302, redirect: "/auth/login"};
    }
</script>
