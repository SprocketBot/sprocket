<script lang="ts" context="module">
    import cookies from "js-cookie";
    import type {Load} from "@sveltejs/kit";

    export const load: Load = ({session}) => {
        if (session.user) {
            return {redirect: "/scrims", status: 302};
        }
        return {};
    };
</script>

<script lang="ts">
    import {
        Card,
        CenteredCardLayout,
        DiscordOAuthButton,
    } from "$lib/components";
    import type {SessionUser} from "$lib/utils";
    import {constants, extractJwt} from "$lib/utils";
    import {session} from "$app/stores";

    async function login(e: CustomEvent<string>) {
        const tokens = e.detail.split(",");

        $session.user = extractJwt<SessionUser>(tokens[0]);
        $session.token = tokens[0];

	// It is important that the auth cookie lasts as long as the refresh token. Do not shorten it, 
	// the JWT expiry should be shorter and will actually expire it in an appropriate timeframe.
        cookies.set(constants.auth_cookie_key, tokens[0], {expires: 7}); // 7 days
        cookies.set(constants.refresh_token_cookie_key, tokens[1], {expires: 7}); // 7 days

        // window.location.pathname = "/scrims";
    }
</script>


<CenteredCardLayout>
    <Card class="bg-base-200">
        <div slot="figure" class="px-8 pt-4 pb-0 h-full w-full">
            <img src="/img/logo.svg" alt="Sprocket"/>
        </div>
        <header slot="title">
            <h1>
                Login
            </h1>
        </header>
        <section class="space-y-4">
            <DiscordOAuthButton on:loggedIn={login}/>
        </section>
    </Card>
</CenteredCardLayout>
