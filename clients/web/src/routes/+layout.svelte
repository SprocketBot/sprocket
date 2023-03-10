<script lang="ts">
    import "@fontsource/montserrat";
    import "../app.postcss";
    import {getAuthCookies} from "$lib/api/auth-cookies";
    import {ToastContainer} from "$lib/components";
    import {SetJwtContext} from "$lib/context";

    SetJwtContext({
        get access() {
            return getAuthCookies().access;
        },
        get refresh() {
            return getAuthCookies().refresh;
        },
    });
</script>

<ToastContainer />
<slot />
