<script lang="ts">
    import {goto} from "$app/navigation";
    import {browser} from "$app/environment";
    import {JwtContext} from "$lib/context";
    import {getExpiryFromJwt} from "../../../utilities/getExpiryFromJwt";
    import {addToast, ToastStatus} from "../Toast";

    export let behavior: "hide" | "login" | "login-with-return" = "hide";

    let valid: boolean;

    // TODO: This can contain action gates?
    const invalid = (reason?: string) => {
        valid = false;
        console.warn(`AuthGuard failed (${reason})`);
        addToast({
            status: ToastStatus.Danger,
            content: "Session Expired. Please sign in.",
            ttl: 10000,
            dismissable: true,
        });

        switch (behavior) {
            case "login":
                goto("/auth/login");
                break;
            case "login-with-return":
                goto(`/auth/login?next=${encodeURI(window.location.pathname)}`);
        }
    };

    const validate = (): string | undefined => {
        const {access, refresh} = JwtContext();
        if (!access) {
            return "No JWT Available";
        } else {
            try {
                if (getExpiryFromJwt(access) < new Date().getTime()) {
                    return "JWT Expired";
                } else {
                    // If we wanted to do action based validation; this is the place.
                }
            } catch (e) {
                return `Error Encountered: ${(e as Error).message}`;
            }
        }
    };

    $: if (browser) {
        const r = validate();
        if (r) invalid(r);
        else valid = true;
    }
</script>

{#if valid}
    <slot />
{:else}
    <slot name="unauthorized" />
{/if}
