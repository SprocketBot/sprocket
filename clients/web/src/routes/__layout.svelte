<script lang='ts' context='module'>
	import type {NavigationItem} from "$lib/types/Navigation";
	import type {Load} from "@sveltejs/kit";

	export const load: Load = ({session}) => {
	    const items: NavigationItem[] = [ {
	        target: "/scrims",
	        label: "Play",
	    } ];

	    // 0 === MLEDB ADMIN
	    if (session.user?.orgTeams.some(s => s === 0)) {
	        items.push({
	            target: "/management",
	            label: "Manage",
	        });
	    }
	    return {
	        props: {
	            navigationItems: items,
	        },
	    };
	};

</script>
<script lang='ts'>
	import "../app.postcss";
	import {setContext} from "svelte";
	import {NavigationContextKey} from "$lib/types";
	import {initializeClient} from "$lib/api/client";
	import {session} from "$app/stores";
	import {
	    AuthGuard, Chatwoot, ToastContainer,
	} from "$lib/components";

	export let navigationItems: NavigationItem[];

	setContext<NavigationItem[]>(NavigationContextKey, navigationItems);

	initializeClient($session);
</script>

<slot />

<ToastContainer showTestButton={false} />

<AuthGuard>
	<Chatwoot />
</AuthGuard>
