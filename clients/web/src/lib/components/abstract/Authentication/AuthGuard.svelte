<script lang="ts">
    import {session} from "$app/stores";
</script>

{#if Boolean($session.user)}
    <slot />
{:else}
    <slot name="unauthenticated" />
{/if}
