<script lang="ts">
    import {UserProfileStore} from "$houdini";
    import {onMount} from "svelte";

    const profileStore = new UserProfileStore();

    onMount(() => {
        profileStore.fetch();
    });
</script>

{$profileStore.data?.me.name}
{$profileStore.data?.me.currentOrganization?.name}
