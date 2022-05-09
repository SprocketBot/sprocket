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
        const token = e.detail;
        
        $session.user = extractJwt<SessionUser>(token);
        $session.token = token;

        cookies.set(constants.auth_cookie_key, token);

        window.location.pathname = "/scrims/queue";
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