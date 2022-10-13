import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {config} from "@sprocketbot/common";
import type {VerifyCallback} from "passport-google-oauth20";
import {Strategy} from "passport-google-oauth20";

import {User, UserAuthenticationAccountType} from "../../../../database";
import {UserService} from "../../../user";
import type {GoogleProfileType} from "../types/profile.type";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor(private readonly userService: UserService) {
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
        profile: GoogleProfileType,
        done: VerifyCallback,
    ): Promise<User | undefined> {
        // First, check if the user already exists
        const queryResult = await this.userService.getUsers({
            where: {email: profile.emails[0].value},
        });

        let user = new User();
        // If no users returned from query, create a new one
        if (queryResult.length === 0) {
            const userProfile = {
                email: profile.emails[0].value,
                displayName: `${profile.name.givenName} ${profile.name.familyName.charAt(0)}`,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
            };

            const authAcct = {
                accountType: UserAuthenticationAccountType.GOOGLE,
                accountId: profile.emails[0].value,
                oauthToken: accessToken,
            };
            user = await this.userService.createUser(userProfile, [authAcct]);
        } else {
            // Else, return the one we found
            user = queryResult[0];
        }
        done(null, user);
        return user;
    }
}
