/* eslint-disable spaced-comment */
/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type {SessionUser} from "$lib/types/SessionUser";

declare namespace App {
    interface Locals {
        user: SessionUser;
        token: string;
    }
    // interface Platform {}
    interface Session {
        gqlUrl: string;
        secure: boolean;

        token?: string;
        user?: SessionUser;
    }

    // interface Stuff {}
}

