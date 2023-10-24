<script lang="ts">
    import {env} from "$env/dynamic/public";
    import {Discord, Steam, Microsoft, Xbox, Epicgames, Google} from "@steeze-ui/simple-icons";
    import {Alert, Button} from "$lib/components";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {oauthPopup, type OauthPopupArgs} from "$lib/actions/useOauthPopup.action";
    import {MyOrganizationsStore} from "$houdini";
    import {next, selectOrganization} from "../helpers";
    import type {ButtonActionTuple} from "$lib/components/atoms/Button/types";
    import {updateAuthCookies} from "$lib/api";

    let errorMessage = "";
    const handleOauthResult = async (e: MessageEvent) => {
        const {token, status, message} = e.data;
        if (status === "error") {
            // Login was not successful. Notify the user of the error.
            // We are assuming that the server's error is safe to show to the user.
            errorMessage = message;
        } else if (status === "success") {
            const [access, refresh] = token.split(",");

            updateAuthCookies({access, refresh});

            const location = new URL(window.location.href);

            if (location.searchParams.has("organizationId")) {
                // If there is a query parameter specifying the organization to select
                // Try to parse that and select it.
                // If we are able to; go straight to the application
                // Otherwise, fall through to the default behavior
                // This is useful in the case when a user is directed here; and needs to get sent back to a specific page for a specific org
                const selected = await selectOrganization(
                    Number.parseInt(location.searchParams.get("organizationId")!.toString()),
                    access,
                );
                if (selected) {
                    next("/app");
                }
            } else {
                // If no default organization is specified, check to see if there is only one
                // If there is only one organization available; move to the app directly
                const orgStore = new MyOrganizationsStore();
                const orgs = await orgStore.fetch({metadata: {accessTokenOverride: access}});
                if (orgs.data?.me.organizations.length === 1) {
                    const selected = await selectOrganization(orgs.data.me.organizations[0].id, access);
                    if (selected) {
                        next("/app");
                    }
                }
            }

            // User needs to select an organization; but we want to keep their next state (if any)
            next(`/auth/organization?next=${location.searchParams.get("next") ?? ""}`, true);
        }
    };

    // All the auth provider URLs share a common url structure
    // We can build this prop dynamically
    const getAction = (provider: string): ButtonActionTuple<OauthPopupArgs> => [
        oauthPopup,
        {
            windowUrl: `${env.PUBLIC_GQL_URL}/authentication/${provider}/login`,
            callback: handleOauthResult,
        } as OauthPopupArgs,
    ];
</script>

<p class="text-center my-2 text-lg">Sign in using:</p>

{#if errorMessage}
    <div class="my-4">
        <Alert variant="danger" dismissible={false} compact>
            {errorMessage}
        </Alert>
    </div>
{/if}

<section class="grid grid-cols-2 gap-2">
<!-- 
    <Button variant="alt" action={getAction("discord")}>
        <Icon src={Discord} class="w-6" />
        Discord
    </Button>
    <Button variant="alt" action={getAction("steam")}>
        <Icon src={Steam} class="w-6" />
        Steam
    </Button>
    <Button variant="alt" action={getAction("microsoft")}>
        <Icon src={Microsoft} class="w-6" />
        Microsoft
    </Button>
    <Button variant="alt" action={getAction("xbox")}>
        <Icon src={Xbox} class="w-6" />
        Xbox
    </Button>
    <Button variant="alt" action={getAction("epic")}>
        <Icon src={Epicgames} class="w-6" />
        Epic
    </Button>
    <Button variant="alt" action={getAction("google")}>
        <Icon src={Google} class="w-6" />
        Google
    </Button>
-->
</section>
