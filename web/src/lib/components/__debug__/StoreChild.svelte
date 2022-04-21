<script lang="ts">
    import {pendingScrims} from "$lib/api";
</script>

{#each $pendingScrims?.data.pendingScrims ?? [] as scrim}
    <pre>{JSON.stringify(scrim, null, 2)}</pre>
{/each}
