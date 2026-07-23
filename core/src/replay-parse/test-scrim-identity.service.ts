import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {createHash} from "crypto";
import {DataSource, Repository} from "typeorm";

import {GameSkillGroup} from "$db/franchise/game_skill_group/game_skill_group.model";
import {Player} from "$db/franchise/player/player.model";
import {Platform} from "$db/game/platform/platform.model";
import {User} from "$db/identity/user/user.model";
import {UserProfile} from "$db/identity/user_profile/user_profile.model";
import type {MLE_Platform} from "$db/mledb";
import {
    League, MLE_Player, MLE_PlayerAccount, ModePreference, Timezone,
} from "$db/mledb";
import {PlayerToPlayer} from "$db/mledb-bridge/player_to_player.model";
import {Member} from "$db/organization/member/member.model";
import {MemberPlatformAccount} from "$db/organization/member_platform_account/member_platform_account.model";
import {Organization} from "$db/organization/organization/organization.model";
import {TestReplayIdentity} from "$db/scheduling/test_replay_identity/test_replay_identity.model";

export interface TestReplayPlayerInput {
    platform: string;
    platformAccountId: string;
    name: string;
}

export interface TestReplayPlayerOutput extends TestReplayPlayerInput {
    userId: number;
    playerId: number;
}

@Injectable()
export class TestScrimIdentityService {
    constructor(
        @InjectRepository(TestReplayIdentity) private readonly identities: Repository<TestReplayIdentity>,
        private readonly dataSource: DataSource,
    ) {}

    async provision(
        testRunId: string,
        organizationId: number,
        skillGroupId: number,
        inputs: TestReplayPlayerInput[],
    ): Promise<TestReplayPlayerOutput[]> {
        const unique = Array.from(new Map(inputs.map(input => [`${input.platform}:${input.platformAccountId}`, input])).values());
        return Promise.all(unique.map(async input => {
            const existing = await this.identities.findOne({
                where: {
                    testRunId,
                    platform: input.platform,
                    platformAccountId: input.platformAccountId,
                },
            });
            if (existing) return {
                ...input, userId: existing.userId, playerId: existing.playerId,
            };

            return this.dataSource.transaction(async manager => {
                const hash = createHash("sha256").update(`${testRunId}:${input.platform}:${input.platformAccountId}`)
                    .digest("hex");
                const mappedPlatformAccountId = `test-${hash.slice(0, 24)}`;
                const email = `${hash.slice(0, 24)}@test.invalid`;
                const user = await manager.save(User, manager.create(User, {type: [] }));
                await manager.save(UserProfile, manager.create(UserProfile, {
                    user,
                    email,
                    displayName: `[TEST] ${input.name || hash.slice(0, 8)}`,
                    description: `Synthetic replay identity for test run ${testRunId}`,
                }));
                const organization = await manager.findOneByOrFail(Organization, {id: organizationId});
                const member = await manager.save(Member, manager.create(Member, {
                    user, userId: user.id, organization, organizationId,
                }));
                const skillGroup = await manager.findOneByOrFail(GameSkillGroup, {id: skillGroupId});
                const player = await manager.save(Player, manager.create(Player, {
                    member,
                    memberId: member.id,
                    skillGroup,
                    skillGroupId,
                    salary: 0,
                }));
                const platform = await manager.findOneByOrFail(Platform, {code: input.platform.toUpperCase()});
                await manager.save(MemberPlatformAccount, manager.create(MemberPlatformAccount, {
                    member,
                    platform,
                    platformAccountId: mappedPlatformAccountId,
                }));
                const mlePlayer = await manager.save(MLE_Player, manager.create(MLE_Player, {
                    mleid: -player.id,
                    name: `[TEST] ${hash.slice(0, 16)}`,
                    discordId: `test-${hash.slice(0, 24)}`,
                    teamName: "TEST",
                    league: League.UNKNOWN,
                    modePreference: ModePreference.BOTH,
                    timezone: Timezone.UNKNOWN,
                    suspended: true,
                }));
                await manager.save(MLE_PlayerAccount, manager.create(MLE_PlayerAccount, {
                    player: mlePlayer,
                    platform: input.platform.toUpperCase() as MLE_Platform,
                    platformId: mappedPlatformAccountId,
                    tracker: null,
                }));
                await manager.save(PlayerToPlayer, manager.create(PlayerToPlayer, {
                    mledPlayerId: mlePlayer.id,
                    sprocketPlayerId: player.id,
                }));
                const identity = await manager.save(TestReplayIdentity, manager.create(TestReplayIdentity, {
                    testRunId,
                    platform: input.platform,
                    platformAccountId: input.platformAccountId,
                    mappedPlatformAccountId,
                    userId: user.id,
                    playerId: player.id,
                    mlePlayerId: mlePlayer.id,
                }));
                return {
                    ...input, userId: identity.userId, playerId: identity.playerId,
                };
            });
        }));
    }

    async mapPlatformAccount(testRunId: string, platform: string, platformAccountId: string): Promise<string | undefined> {
        const identity = await this.identities.findOne({
            where: {
                testRunId, platform, platformAccountId,
            },
        });
        return identity?.mappedPlatformAccountId;
    }
}
