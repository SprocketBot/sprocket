<script lang="ts">
    import {UserProfileStore} from "$houdini";
    import {onMount} from "svelte";

    const profileStore = new UserProfileStore();

    onMount(() => {
        profileStore.fetch();
    });
    
    let fetching = true;

</script>

"This is where we'll put the league match submissions page."
<div>
{#if fetching}
    Fetching data, please wait. 
{:else}
    Here's that data you ordered, sir. 
{/if}
</div>