<script lang="ts" context="module">
    import type {Load} from "@sveltejs/kit";
    import cookies from "js-cookie";

    export const load: Load = ({session}) => {
        if (session.user) {
            return {redirect: "/scrims", status: 302};
        }
        return {};
    };
</script>

<script lang="ts">
    import {session} from "$app/stores";
    import {
        Card,
        CenteredCardLayout,
        DiscordOAuthButton,
    } from "$lib/components";
    import type {SessionUser} from "$lib/utils";
    import {constants, extractJwt} from "$lib/utils";

    function login(e: CustomEvent<string>): void {
        const tokens = e.detail.split(",");

        $session.user = extractJwt<SessionUser>(tokens[0]);
        $session.token = tokens[0];

        cookies.set(constants.auth_cookie_key, tokens[0], {expires: 0.25}); // 6 hours
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
