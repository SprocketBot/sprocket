<script lang="ts">
    // export const extractJwt = <T>(rawToken: string): T =>
    // JSON.parse(atob(rawToken.split(".")[1])) as T;
    import {session} from "$app/stores";
    export let expectedOrg = "0";
    const isInOrg = $session.user.org === expectedOrg;
</script>

{#if isInOrg}
    <slot/>
{:else}
    <slot name="unauthorized" />
{/if}