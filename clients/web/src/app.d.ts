/* eslint-disable spaced-comment */
/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type {SSRData} from "@urql/core/dist/types/exchanges/ssr";
import type {Config, SessionUser} from "$lib/utils";
import type {
    ChatwootGlobal, ChatwootSDK, ChatwootSettings,
} from "$lib/components/abstract/Chatwoot";

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
        chatwootSettings?: Partial<ChatwootSettings>;
        chatwootSDK?: ChatwootSDK;
        $chatwoot?: ChatwootGlobal;
    }
}
