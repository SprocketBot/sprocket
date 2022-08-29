<script lang="ts">
    import {activeSubmissionsStore, type Submission} from "$lib/api";
    import Row from "./Row.svelte";

    let submissions: Submission[] | undefined;
    $: submissions = $activeSubmissionsStore.data?.activeSubmissions;
</script>


<table class="table table-compact table-zebra text-center w-full">
    <thead>
        <tr>
            <th>Scrim/Match</th>
            <th>Scrim/Match ID</th>
            <th>Creator</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        {#if submissions}
            {#each submissions as submission (submission.creatorId)}
                <Row submission={submission} />
            {/each}
        {/if}
    </tbody>
</table>


<style lang="postcss">

</style>
