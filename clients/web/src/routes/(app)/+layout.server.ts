import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = ({
    locals
}) => {
    if (locals.authToken) {
        return {authToken: locals.authToken}
    }

}