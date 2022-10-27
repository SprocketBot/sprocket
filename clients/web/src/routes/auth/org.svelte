<script lang="ts" context="module">
    import type {Load} from "@sveltejs/kit";
    import cookies from "js-cookie";

    export const load: Load = ({session}) => {
        if (!session.user) {
            return {redirect: "/auth/login", status: 302};
        }
        return {};
    };
</script>

<script lang="ts">
    import {goto} from "$app/navigation";
    import {session} from "$app/stores";
    import {currentUser} from "$lib/api";
    import {Card, CenteredCardLayout} from "$lib/components";

    import {switchOrganizationMutation} from "../../lib/api/mutations/SwitchOrganization.mutation";
    import Spinner from "../../lib/components/atoms/Spinner.svelte";
    import {type SessionUser, constants, extractJwt} from "../../lib/utils";

    async function login(orgId: number): Promise<void> {
        const {
            switchOrganization: {access, refresh},
        } = await switchOrganizationMutation({organizationId: orgId});

        $session.user = extractJwt<SessionUser>(access);
        $session.token = access;

        cookies.set(constants.auth_cookie_key, access, {expires: 0.25}); // 6 hours
        cookies.set(constants.refresh_token_cookie_key, refresh, {
            expires: 7,
        });
        goto("/scrims");
    }
</script>

<CenteredCardLayout>
    <Card class="bg-base-200">
        <div slot="figure" class="px-8 pt-4 pb-0 h-full w-full">
            <img src="/img/logo.svg" alt="Sprocket" />
        </div>
        <header slot="title">
            <h1>Select Organization</h1>
        </header>
        {#if $currentUser.fetching}
            <div class="h-full w-full flex items-center justify-center">
                <Spinner class="h-16 w-full" />
            </div>
        {:else}
            {#each $currentUser.data.me.members as { organization: { id, profile: { name } } }}
                <section class="space-y-4 text-center">
                    <button class="btn py-1" on:click={() => login(id)}>
                        <span>{name}</span>
                    </button>
                </section>
            {/each}
        {/if}
    </Card>
</CenteredCardLayout>
