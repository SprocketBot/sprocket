import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {readFileSync} from "fs";
import type {Profile} from "passport-discord";
import {Strategy} from "passport-discord";
import {UserAuthenticationAccountType} from "src/database";
import {User} from "src/database/identity/user/user.model";
import {UserService} from "src/identity/user/user.service";

import {config} from "../../../util/config";

export type Done = (err: Error, user: User) => void;

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {

    constructor(private readonly userService: UserService) {
        super({
            clientID: config.auth.discordClientId,
            clientSecret: readFileSync("./secret/discord-secret.txt").toString(),
            callbackURL: config.auth.discordCallbackURL,
            scope: ["identify", "email", "guilds", "guilds.members.read"],
        });
        console.log("Client ID: ", config.auth.discordClientId);
        console.log("Callback URL: ", config.auth.discordCallbackURL);
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: Done,
    ): Promise<User | undefined> {
        
        console.log("Validatig Discord OAuth call.");
        const {
            id: discordId, email, discriminator, username, avatar,
        } = profile;

        // First, check if the user already exists
        const queryResult = await this.userService.getUsers({where: {email: email} });

        let user = new User();
        // If no users returned from query, create a new one
        if (queryResult.length === 0) {
            const userProfile = {
                description: "Discord user",
                email: email,
                firstName: username,
                lastName: "",
            };

            const authAcct = {
                accountType: UserAuthenticationAccountType.DISCORD,
                accountId: discordId,
                oauthToken: accessToken,
            };
            user = await this.userService.createUser(userProfile, [authAcct]);
        } else {
        // Else, return the one we found
            user = queryResult[0];
        }

        return user;
    }
}
