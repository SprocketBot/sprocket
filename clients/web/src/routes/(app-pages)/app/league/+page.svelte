<script lang="ts">
    import {UserProfileStore} from "$houdini";
    import {onMount} from "svelte";

    const profileStore = new UserProfileStore();

    onMount(() => {
        profileStore.fetch();
    });
</script>

"This is where we'll put the league match submissions page."
