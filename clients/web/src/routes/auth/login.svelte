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
    import {goto} from "$app/navigation";

    import {Card, CenteredCardLayout} from "$lib/components";
    import {anonLoginMutation} from "$lib/api";
    import {constants, extractJwt} from "$lib/utils";
    import {session} from "$app/stores";

    let username: string;

    async function login() {
        const {token} = await anonLoginMutation({username});
        cookies.set(constants.auth_cookie_key, token);
        $session.user = extractJwt(token);
        $session.token = token;
        goto("/scrims/queue").catch(console.error);
    }

    const handleEnter: svelte.JSX.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.code === "Enter") login()
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
            <div class="form-control">
                <label class="label" for="username">
                    <span class="label-text">Username:</span>
                </label>
                <input class="input" name="username" bind:value={username} on:keypress={handleEnter} />
            </div>

            <button class="btn px-8 btn-primary btn-outline mx-auto block" on:click={login}>Login</button>
        </section>
    </Card>
</CenteredCardLayout>