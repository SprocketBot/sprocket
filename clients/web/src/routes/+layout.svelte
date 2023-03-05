<script>
    import "@fontsource/montserrat";
    import "../app.postcss";
    import {getSession} from "$houdini";
    import {getAuthCookies} from "$lib/api/auth-cookies";
    import {ToastContainer} from "$lib/components";
    import {SetJwtContext} from "$lib/context";

    let session;

    getSession().then(r => (session = r));

    SetJwtContext({
        get access() {
            return session?.access ?? getAuthCookies().access;
        },
        get refresh() {
            return session?.refresh ?? getAuthCookies().refresh;
        },
    });
</script>

<ToastContainer />
<slot />
