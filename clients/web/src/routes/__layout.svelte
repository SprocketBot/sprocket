<script lang="ts">
    import "../app.postcss";

    import {session} from "$app/stores";
    import {initializeClient} from "$lib/api/client";
    import {
        AuthGuard,
        Chatwoot,
        StackBanner,
        ToastContainer,
    } from "$lib/components";
    import {ADMIN_NAV_ITEM, navigationStore} from "$lib/stores";

    $: {
        const isAdmin = $session.user?.orgTeams.some(s => s === 0);
        if (isAdmin) {
            navigationStore.update(prev => [...prev, ADMIN_NAV_ITEM]);
        }
    }

    initializeClient($session);
</script>

<svelte:head>
    <title>Sprocket</title>
</svelte:head>

<StackBanner />

<slot />

<ToastContainer showTestButton={false} />

<AuthGuard>
    <Chatwoot />
</AuthGuard>
