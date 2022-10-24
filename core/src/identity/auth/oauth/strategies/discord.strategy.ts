import {forwardRef, Inject, Injectable, Logger} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {AnalyticsEndpoint, AnalyticsService, config} from "@sprocketbot/common";
import type {Profile} from "passport-discord";
import {Strategy} from "passport-discord";

import type {User} from "$models";
import {
    GameSkillGroupRepository,
    MemberPlatformAccountRepository,
    MemberRepository,
    PlatformRepository,
    UserAuthenticationAccountRepository,
    UserProfiledRepository,
} from "$repositories";
import {UserAuthenticationAccountType} from "$types";

import {PlayerService} from "../../../../franchise";
import {MledbPlayerAccountService, MledbPlayerService} from "../../../../mledb";

export type Done = (err: string, user: User) => void;
const MLE_ORGANIZATION_ID = 2;

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {
    private readonly logger = new Logger(DiscordStrategy.name);

    constructor(
        private readonly userProfiledRepository: UserProfiledRepository,
        private readonly userAuthenticationAccountRepository: UserAuthenticationAccountRepository,
        private readonly memberRepository: MemberRepository,
        private readonly memberPlatformAccountRepository: MemberPlatformAccountRepository,
        private readonly platformRepository: PlatformRepository,
        private readonly analyticsService: AnalyticsService,
        @Inject(forwardRef(() => MledbPlayerService))
        private readonly mledbPlayerService: MledbPlayerService,
        @Inject(forwardRef(() => MledbPlayerAccountService))
        private readonly mledbPlayerAccountService: MledbPlayerAccountService,
        private readonly skillGroupRepository: GameSkillGroupRepository,
        @Inject(forwardRef(() => PlayerService))
        private readonly playerService: PlayerService,
    ) {
        super({
            clientID: config.auth.discord.clientId,
            clientSecret: config.auth.discord.secret,
            callbackURL: config.auth.discord.callbackURL,
            scope: ["identify", "email"],
            prompt: "none",
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: Done): Promise<User | undefined> {
        const mledbPlayer = await this.mledbPlayerService.getPlayerByDiscordId(profile.id).catch(() => null);
        if (!mledbPlayer) throw new Error("User is not associated with MLE");

        const discordAccount = await this.userAuthenticationAccountRepository.getOrNull({
            where: {
                accountType: UserAuthenticationAccountType.DISCORD,
                accountId: profile.id,
            },
            relations: {user: true},
        });
        let user = discordAccount?.user;

        // It's possible the email doesn't exist if the user didn't verify it.
        if (!user && !profile.email)
            throw new Error("User account could not be found and there is no attached email to the Discord user");

        // TODO: Do we want to actually do this? Theoretically, if a user changes their email, that's a "new user" if we go by email. Hence ^
        if (!user) {
            const userProfile = await this.userProfiledRepository.profileRepository.getOrNull({
                where: {email: profile.email},
                relations: {user: true},
            });
            user = userProfile?.user;
        }

        // If no users returned from query, create a new one
        if (!user) {
            const userProfile = {
                email: profile.email!,
                displayName: profile.username,
            };

            user = await this.userProfiledRepository.createAndSave({profile: userProfile});

            await this.userAuthenticationAccountRepository.createAndSave({
                accountType: UserAuthenticationAccountType.DISCORD,
                accountId: profile.id,
                oauthToken: accessToken,
                userId: user.id,
            });

            this.analyticsService
                .send(AnalyticsEndpoint.Analytics, {
                    name: "SprocketAccountImported",
                    tags: [["source", "MLEDB"]],
                    strings: [
                        ["account_id", profile.id],
                        ["displayname", profile.username],
                    ],
                })
                .then(() => {
                    this.logger.log("Account Import Recorded via Analytics");
                })
                .catch(this.logger.error.bind(this.logger));
        } else if (!discordAccount) {
            await this.userAuthenticationAccountRepository.createAndSave({
                accountType: UserAuthenticationAccountType.DISCORD,
                accountId: profile.id,
                oauthToken: accessToken,
                userId: user.id,
            });
        }

        let member = await this.memberRepository.findOneOrFail({where: {user: {id: user.id}}}).catch(() => null);

        if (!member) {
            member = await this.memberRepository.createAndSave({
                organizationId: MLE_ORGANIZATION_ID,
                userId: user.id,
                profile: {name: mledbPlayer.name},
            });
        }

        const mledbPlayerAccounts = await this.mledbPlayerAccountService.getPlayerAccounts({
            where: {player: {id: mledbPlayer.id}},
        });

        for (const mledbPlayerAccount of mledbPlayerAccounts) {
            if (!mledbPlayerAccount.platformId) continue;

            const platformAccount = await this.memberPlatformAccountRepository
                .findOneOrFail({
                    where: {
                        member: {id: member.id},
                        platform: {code: mledbPlayerAccount.platform},
                        platformAccountId: mledbPlayerAccount.platformId,
                    },
                    relations: ["member", "platform"],
                })
                .catch(() => null);

            if (!platformAccount) {
                let platform = await this.platformRepository.getOrNull({where: {code: mledbPlayerAccount.platform}});
                if (!platform)
                    platform = await this.platformRepository.createAndSave({code: mledbPlayerAccount.platform});

                await this.memberPlatformAccountRepository.createAndSave({
                    memberId: member.id,
                    platformId: platform.id,
                    platformAccountId: mledbPlayerAccount.platformId,
                });
            }
        }

        if (!["PREMIER", "MASTER", "CHAMPION", "ACADEMY", "FOUNDATION"].includes(mledbPlayer.league))
            throw new Error("Player does not belong to a league");

        const skillGroup = await this.skillGroupRepository.getByCode(`${mledbPlayer.league[0]}L`, {
            relations: {profile: true},
        });
        const player = await this.playerService.getPlayer({where: {member: {id: member.id}}}).catch(() => null);
        if (!player) await this.playerService.createPlayer(member.id, skillGroup.id, mledbPlayer.salary);

        done("", user);
        return user;
    }
}
