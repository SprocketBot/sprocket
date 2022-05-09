// / <reference types="@sveltejs/kit" />
import type {SessionUser} from "$lib/utils";

export interface Session {
    gqlUrl: string;
    secure: boolean;

    token?: string;
    user?: SessionUser;
}

declare global {
    declare namespace App {
        declare type Session = Session;

        declare interface Locals {
            user: SessionUser;
            token: string;
        }
    }
}
