import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import type {VerifyCallback} from "passport-google-oauth20";
import {Strategy} from "passport-google-oauth20";

import type {GoogleProfile} from "./google.types";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor() {
        super({
            clientID: config.auth.google.clientId,
            clientSecret: config.auth.google.secret,
            callbackURL: config.auth.google.callbackUrl,
            scope: ["email", "profile"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback,
    ): Promise<{id: number}> {
        console.log(profile);
        // First, check if the user already exists
        const user = {id: 10};

        done(null, user);
        return user;
    }
}
