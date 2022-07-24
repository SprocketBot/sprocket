/* eslint-disable spaced-comment */
/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type {SessionUser} from "$lib/types/SessionUser";

import type {ChatwootSDK} from "$lib/components/abstract/Chatwoot";
import type {Config} from "./lib/utils/types";

declare global {
    declare namespace App {
        interface Locals {
            user: SessionUser;
            token: string;
        }

        interface Session {
            config: Config;
    
            token?: string;
            user?: SessionUser;
        }
    }

    declare interface Window {
        chatwootSDK?: ChatwootSDK;
    }
}

