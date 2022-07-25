/* eslint-disable spaced-comment */
/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type {SSRData} from "@urql/core/dist/types/exchanges/ssr";
import type {
    Chatwoot, ChatwootSDK, Config, SessionUser,
} from "./lib/utils";

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

    interface Window {
        __URQL_DATA__?: SSRData;
        chatwootSDK?: ChatwootSDK;
        $chatwoot?: Chatwoot;
    }
}
