<script lang="ts">
    import {env} from "$env/dynamic/public";
    import {Discord, Steam, Microsoft, Xbox, Epicgames, Google} from "@steeze-ui/simple-icons";
    import {Button} from "$lib/components";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {oauthPopup} from "$lib/actions/useOauthPopup.action";

    const handleOauthResult = (e: MessageEvent) => {
        const {token} = e.data;
        localStorage.setItem("sprocket-token", token);
    };
</script>

<p class="text-center my-2 text-lg">Sign in using:</p>
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
