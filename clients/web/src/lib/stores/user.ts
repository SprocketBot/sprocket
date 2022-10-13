import type {App} from "@sveltejs/kit";
import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import {session} from "$app/stores";
import type {SessionUser} from "$lib/utils";

export const user = derived<Readable<App.Session>, SessionUser>(
    session,
    (v: App.Session, s) => {
        s(v.user);
    },
);
