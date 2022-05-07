import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {readFileSync} from "fs";
import type {Profile} from "passport-discord";
import {Strategy} from "passport-discord";
import {UserAuthenticationAccountType} from "src/database";
import {User} from "src/database/identity/user/user.model";
import {UserService} from "src/identity/user/user.service";
import type { IrrelevantFields } from "src/database";
import type { UserProfile } from "src/database";
import type { UserAuthenticationAccount } from "src/database";
import {config} from "../../../util/config";

export type Done = (err: string, user: User) => void;

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
        
        console.log("Validating Discord OAuth call.");
        const {
            id: discordId, email, discriminator, username, avatar,
        } = profile;

        const mleGuild = profile.guilds.find(obj => obj.id == '172404472637685760');

        if (mleGuild.length === 0) {
            console.log("Nope, sucka");
        } else {
            console.log("This person is a member of MLE.");
        }
        // First, check if the user already exists
        const queryResult = await this.userService.getUsers({where: {email: email} });

        let user = new User();
        // If no users returned from query, create a new one
        if (queryResult.length === 0) {
            const userProfile: Omit<UserProfile, IrrelevantFields | "id" | "user"> = {
                description: "Discord user",
                email: email,
                firstName: username,
                lastName: "",
            };

            const authAcct: Omit<UserAuthenticationAccount, IrrelevantFields | "id" | "user"> = {
                accountType: UserAuthenticationAccountType.DISCORD,
                accountId: discordId as string,
                oauthToken: accessToken,
            };
            user = await this.userService.createUser(userProfile, [authAcct]);
        } else {
            // Else, return the one we found
            user = queryResult[0];
            let discordAccount: UserAuthenticationAccount | undefined;
            if (user.authenticationAccounts) {
                discordAccount = user.authenticationAccounts.find(obj => obj.accountType === UserAuthenticationAccountType.DISCORD);
            }
            if (!discordAccount) {
                const authAcct: Omit<UserAuthenticationAccount, IrrelevantFields | "id" | "user"> = {
                    accountType: UserAuthenticationAccountType.DISCORD,
                    accountId: discordId as string,
                    oauthToken: accessToken,
                };
                user = await this.userService.addAuthenticationAccounts(user.id, [authAcct]);
            }
        }

        done("", user);
        return user;
    }
}
