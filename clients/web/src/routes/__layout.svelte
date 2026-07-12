<script lang='ts'>
    import "../app.postcss";
    import {initializeClient} from "$lib/api/client";
    import {session} from "$app/stores";
    import {
        AuthGuard, StackBanner, ToastContainer,
    } from "$lib/components";
    import {navigationStore, ADMIN_NAV_ITEM} from "$lib/stores";

    $: {
        const isAdmin = $session.user?.orgTeams.some(s => s === 0) ?? false;
        navigationStore.update(prev => {
            const hasAdmin = prev.includes(ADMIN_NAV_ITEM);
            if (isAdmin && !hasAdmin) return [...prev, ADMIN_NAV_ITEM];
            if (!isAdmin && hasAdmin) return prev.filter(item => item !== ADMIN_NAV_ITEM);
            return prev;
        });
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
</AuthGuard>
