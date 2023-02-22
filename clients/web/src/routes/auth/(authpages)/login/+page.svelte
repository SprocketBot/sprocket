<script lang="ts">
    import {env} from "$env/dynamic/public";
    import {Discord, Steam, Microsoft, Xbox, Epicgames, Google} from "@steeze-ui/simple-icons";
    import {Alert, Button} from "$lib/components";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {oauthPopup} from "$lib/actions/useOauthPopup.action";
    import {goto} from "$app/navigation";

    let errorMessage = "";
    const handleOauthResult = (e: MessageEvent) => {
        const {token, status, message} = e.data;
        if (status === "error") {
            // Handle Error
            errorMessage = message;
        } else if (status === "success") {
            localStorage.setItem("sprocket-token", token);
            const location = new URL(window.location.href);
            if (location.searchParams.has("next")) {
                console.log(`next=${location.searchParams.get("next")}`);
                goto(location.searchParams.get("next")!);
            } else {
                goto("/app");
            }
        }
    };
</script>

<p class="text-center my-2 text-lg">Sign in using:</p>

{#if errorMessage}
    <div class="my-4">
        <Alert variant="danger" dismissible={false} compact>
            {errorMessage}
        </Alert>
    </div>
{/if}

<section class="grid grid-cols-2">
    <Button
        variant="alt"
        action={[
            oauthPopup,
            {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/discord/login`, callback: handleOauthResult},
        ]}
    >
        <Icon src={Discord} class="w-6" />
        Discord
    </Button>
    <Button
        variant="alt"
        action={[
            oauthPopup,
            {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/steam/login`, callback: handleOauthResult},
        ]}
    >
        <Icon src={Steam} class="w-6" />
        Steam
    </Button>
    <Button
        variant="alt"
        action={[
            oauthPopup,
            {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/microsoft/login`, callback: handleOauthResult},
        ]}
    >
        <Icon src={Microsoft} class="w-6" />
        Microsoft
    </Button>
    <Button
        variant="alt"
        action={[
            oauthPopup,
            {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/xbox/login`, callback: handleOauthResult},
        ]}
    >
        <Icon src={Xbox} class="w-6" />
        Xbox
    </Button>
    <Button
        variant="alt"
        action={[
            oauthPopup,
            {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/epic/login`, callback: handleOauthResult},
        ]}
    >
        <Icon src={Epicgames} class="w-6" />
        Epic
    </Button>
    <Button
        variant="alt"
        action={[
            oauthPopup,
            {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/google/login`, callback: handleOauthResult},
        ]}
    >
        <Icon src={Google} class="w-6" />
        Google
    </Button>
</section>
