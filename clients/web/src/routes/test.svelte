<script lang="ts">
    import {session} from "$app/stores";
    import {currentUser} from "$lib/api";
    currentUser.vars = {
        orgId: $session.org,
    };
</script>

<div class="h-screen w-full flex justify-center items-center overflow-auto">
    <pre>{JSON.stringify($currentUser.data, null, 2)}</pre>
</div>
