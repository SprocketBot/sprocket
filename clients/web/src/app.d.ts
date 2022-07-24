/* eslint-disable spaced-comment */
/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type {SessionUser} from "$lib/types/SessionUser";

import type {Config} from "./lib/utils/types";
import type {SSRData} from "@urql/core/dist/types/exchanges/ssr";
import type {ChatwootSDK, Chatwoot} from "./lib/utils/types/Chatwoot";

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
        __URQL_DATA__?: SSRData;
        chatwootSDK?: ChatwootSDK;
        $chatwoot?: Chatwoot;
    }
}
