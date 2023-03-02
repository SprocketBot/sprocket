import {setSession} from "$houdini";
import type {Handle} from "@sveltejs/kit";

export const handle: Handle = async ({event, resolve}) => {
    // Get session information
    const access = event.cookies.get("sprocket-access-token");
    const refresh = event.cookies.get("sprocket-refresh-token");

    // Set the session
    setSession(event, {access, refresh});

    // pass the event onto the default handle
    return await resolve(event);
};
