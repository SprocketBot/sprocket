// / <reference types="@sveltejs/kit" />
import type {SessionUser} from "$lib/utils";

declare namespace App {
    declare interface Session {
        gqlUrl: string;
        secure: boolean;

        token?: string;
        user?: SessionUser;
    }
}
