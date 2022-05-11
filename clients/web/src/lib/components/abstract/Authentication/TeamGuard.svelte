<script lang="ts">
    //export const extractJwt = <T>(rawToken: string): T =>
    //JSON.parse(atob(rawToken.split(".")[1])) as T;
    import { session } from "$app/stores";
    export let expectedTeam = '0';
    let isInTeam = $session.user.orgTeams.find(obj => obj === expectedTeam);
</script>

{#if isInTeam}
    <slot/>
{:else}
    <slot name="unauthorized" />
{/if}