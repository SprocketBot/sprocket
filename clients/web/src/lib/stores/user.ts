import type {Readable} from "svelte/store";
import {derived} from "svelte/store";
import {session} from "$app/stores";
import type {SessionUser} from "$lib/utils";
import type {App} from "@sveltejs/kit";

export const user = derived<Readable<App.Session>, SessionUser>(session, (v: App.Session, s) => {
    s(v.user);
});
