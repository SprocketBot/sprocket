import {Injectable, Logger} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {
    AnalyticsEndpoint, AnalyticsService, config,
} from "@sprocketbot/common";
import type {Profile} from "passport-discord";
import {Strategy} from "passport-discord";

import type {
    IrrelevantFields, User, UserAuthenticationAccount, UserProfile,
} from "../../../../database";
import {UserAuthenticationAccountType} from "../../../../database";
import {GameSkillGroupService, PlayerService} from "../../../../franchise";
import {PlatformService} from "../../../../game";
import {MledbPlayerAccountService, MledbPlayerService} from "../../../../mledb";
import {MemberPlatformAccountService, MemberService} from "../../../../organization";
import {IdentityService} from "../../../identity.service";
import {UserService} from "../../../user";

export type Done = (err: string, user: User) => void;
const MLE_ORGANIZATION_ID = 2;

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {

    private readonly logger = new Logger(DiscordStrategy.name);

    constructor(
        private readonly identityService: IdentityService,
        private readonly userService: UserService,
        private readonly memberService: MemberService,
        private readonly memberPlatformAccountService: MemberPlatformAccountService,
        private readonly playerService: PlayerService,
        private readonly platformService: PlatformService,
        private readonly skillGroupService: GameSkillGroupService,
        private readonly mledbPlayerService: MledbPlayerService,
        private readonly mledbPlayerAccountService: MledbPlayerAccountService,
        private readonly analyticsService: AnalyticsService,
    ) {
        super({
            clientID: config.auth.discord.clientId,
            clientSecret: config.auth.discord.secret,
            callbackURL: config.auth.discord.callbackURL,
            scope: ["identify", "email", "guilds", "guilds.members.read"],
            prompt: "none",
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: Done,
    ): Promise<User | undefined> {
        // const guilds: GuildInfo[] = profile.guilds ?? [];
        // if (!guilds.some(g => g.id === MLE_GUILD_ID)) return undefined;

        const mledbPlayer = await this.mledbPlayerService.getPlayerByDiscordId(profile.id).catch(() => null);
        if (!mledbPlayer) throw new Error("User is not associated with MLE");

        const userByDiscordId = await this.identityService.getUserByAuthAccount(UserAuthenticationAccountType.DISCORD, profile.id).catch(() => undefined);
        let user = userByDiscordId;

        // It's possible the email doesn't exist if the user didn't verify it.
        if (!user && !profile.email) throw new Error("User account could not be found and there is no attached email to the Discord user");

        // TODO: Do we want to actually do this? Theoretically, if a user changes their email, that's a "new user" if we go by email. Hence ^
        if (!user) user = await this.userService.getUser({where: {email: profile.email} });

        // If no users returned from query, create a new one
        if (!user) {
            const userProfile: Omit<UserProfile, IrrelevantFields | "id" | "user"> = {
                email: profile.email!,
                displayName: profile.username,
            };

            const authAcct: Omit<UserAuthenticationAccount, IrrelevantFields | "id" | "user"> = {
                accountType: UserAuthenticationAccountType.DISCORD,
                accountId: profile.id,
                oauthToken: accessToken,
            };

            user = await this.userService.createUser(userProfile, [authAcct]);

            this.analyticsService.send(AnalyticsEndpoint.Analytics, {
                name: "SprocketAccountImported",
                tags: [
                    ["source", "MLEDB"],
                ],
                strings: [
                    ["account_id", profile.id],
                    ["displayname", profile.username],
                ],
            })
                .then(() => { this.logger.log("Account Import Recorded via Analytics") })
                .catch(this.logger.error.bind(this.logger));
        } else if (!userByDiscordId) {
            const authAcct: Omit<UserAuthenticationAccount, IrrelevantFields | "id" | "user"> = {
                accountType: UserAuthenticationAccountType.DISCORD,
                accountId: profile.id,
                oauthToken: accessToken,
            };

            await this.userService.addAuthenticationAccounts(user.id, [authAcct]);
        }

        let member = await this.memberService.getMember({where: {user: {id: user.id} } }).catch(() => null);

        if (!member) {
            member = await this.memberService.createMember(
                {name: mledbPlayer.name},
                MLE_ORGANIZATION_ID,
                user.id,
            );
        }

        const mledbPlayerAccounts = await this.mledbPlayerAccountService.getPlayerAccounts({where: {player: {id: mledbPlayer.id} } });

        for (const mledbPlayerAccount of mledbPlayerAccounts) {
            if (!mledbPlayerAccount.platformId) continue;

            const platformAccount = await this.memberPlatformAccountService.getMemberPlatformAccount({
                where: {
                    member: {id: member.id},
                    platform: {code: mledbPlayerAccount.platform},
                    platformAccountId: mledbPlayerAccount.platformId,
                },
                relations: ["platform"],
            }).catch(() => null);

            if (!platformAccount) {
                const platform = await this.platformService.getPlatformByCode(mledbPlayerAccount.platform)
                    .catch(async () => this.platformService.createPlatform(mledbPlayerAccount.platform));

                await this.memberPlatformAccountService.createMemberPlatformAccount(member.id, platform.id, mledbPlayerAccount.platformId);
            }
        }

        if (!["PREMIER", "MASTER", "CHAMPION", "ACADEMY", "FOUNDATION"].includes(mledbPlayer.league)) throw new Error("Player does not belong to a league");

        const skillGroup = await this.skillGroupService.getGameSkillGroup({where: {code: `${mledbPlayer.league[0]}L`} });
        const player = await this.playerService.getPlayer({where: {member: {id: member.id} } }).catch(() => null);
        if (!player) await this.playerService.createPlayer(member.id, skillGroup.id, mledbPlayer.salary);

        done("", user);
        return user;
    }
}
