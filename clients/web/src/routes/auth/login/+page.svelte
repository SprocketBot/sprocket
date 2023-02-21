<script lang="ts">
    import {env} from "$env/dynamic/public";
    import {faDiscord, faSteam, faMicrosoft, faXbox, faGoogle} from "@fortawesome/free-brands-svg-icons"
    import {Button} from "$lib/components"
    import { Icon } from "@steeze-ui/svelte-icon";
    import { IconDefinitionToIconSource } from "$lib/utilities/iconDefinitionToIconSource";
    import { EpicGames } from "$lib/images/logo/EpicGames.icon";
    import { oauthPopup } from "$lib/actions/useOauthPopup.action";


    const handleOauthResult = (e: MessageEvent) => {
        const {token} = e.data
        localStorage.setItem("sprocket-token", token)
    }
</script>

<p class="text-center my-2 text-lg">Sign in using:</p>
<section class="grid grid-cols-2">
    <Button class="gap-4" variant="alt" action={[oauthPopup, {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/discord/login`, callback: handleOauthResult} ]}>
        <Icon src={IconDefinitionToIconSource(faDiscord)} class="w-6"/>
        Discord
    </Button>
    <Button class="gap-4" variant="alt" action={[oauthPopup, {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/steam/login`, callback: handleOauthResult} ]}>
        <Icon src={IconDefinitionToIconSource(faSteam)} class="w-6"/>
        Steam
    </Button>
    <Button class="gap-4" variant="alt" action={[oauthPopup, {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/microsoft/login`, callback: handleOauthResult} ]}>
        <Icon src={IconDefinitionToIconSource(faMicrosoft)} class="w-6"/>
        Microsoft
    </Button>
    <Button class="gap-4" variant="alt" action={[oauthPopup, {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/xbox/login`, callback: handleOauthResult} ]}>
        <Icon src={IconDefinitionToIconSource(faXbox)} class="w-6"/>
        Xbox
    </Button>
    <Button class="gap-4" variant="alt" action={[oauthPopup, {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/epic/login`, callback: handleOauthResult} ]}>
        <Icon src={EpicGames} class="w-6"/>
        Epic
    </Button>
    <Button class="gap-4" variant="alt" action={[oauthPopup, {windowUrl: `${env.PUBLIC_GQL_URL}/authentication/google/login`, callback: handleOauthResult} ]}>
        <Icon src={IconDefinitionToIconSource(faGoogle)} class="w-6"/>
        Google
    </Button>
</section>