<script lang='ts'>
	import "../app.postcss";
	import {initializeClient} from "$lib/api/client";
	import {session} from "$app/stores";
	import {
	    AuthGuard, Chatwoot, ToastContainer,
	} from "$lib/components";
	import {navigationStore, ADMIN_NAV_ITEM} from "$lib/stores";

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

<slot />

<ToastContainer showTestButton={false} />

<AuthGuard>
	<Chatwoot />
</AuthGuard>
