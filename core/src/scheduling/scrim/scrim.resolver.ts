import {Parent, ResolveField, Resolver} from "@nestjs/graphql";

import {GameSkillGroupRepository} from "../../franchise/database/game-skill-group.repository";
import {GameSkillGroupObject, gameSkillGroupObjectFromEntity} from "../../franchise/graphql/game-skill-group.object";
import {GameModeRepository} from "../../game/database/game-mode.repository";
import {GameModeObject, gameModeObjectFromEntity} from "../../game/graphql/game-mode.object";
import {UserRepository} from "../../identity/database/user.repository";
import {UserObject, userObjectFromEntity} from "../../identity/graphql/user.object";
import {OrganizationRepository} from "../../organization/database/organization.repository";
import {OrganizationObject, organizationObjectFromEntity} from "../../organization/graphql/organization.object";
import {ScrimObject} from "../graphql/scrim/scrim.object";

@Resolver(() => ScrimObject)
export class ScrimResolver {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly gameModeRepository: GameModeRepository,
        private readonly gameSkillGroupRepository: GameSkillGroupRepository,
    ) {}

    @ResolveField(() => UserObject)
    async author(@Parent() scrim: Partial<ScrimObject>): Promise<UserObject> {
        if (scrim.author) return scrim.author;

        const user = await this.userRepository.findOneOrFail({
            where: {id: scrim.authorUserId},
            relations: {profile: true},
        });

        return userObjectFromEntity(user, user.profile);
    }

    @ResolveField(() => OrganizationObject)
    async organization(@Parent() scrim: Partial<ScrimObject>): Promise<OrganizationObject> {
        if (scrim.organization) return scrim.organization;

        const organization = await this.organizationRepository.findOneOrFail({
            where: {id: scrim.organizationId},
            relations: {profile: true},
        });

        return organizationObjectFromEntity(organization, organization.profile);
    }

    @ResolveField(() => GameModeObject)
    async gameMode(@Parent() scrim: Partial<ScrimObject>): Promise<GameModeObject> {
        if (scrim.gameMode) return scrim.gameMode;

        const gameMode = await this.gameModeRepository.findOneOrFail({where: {id: scrim.gameModeId}});

        return gameModeObjectFromEntity(gameMode);
    }

    @ResolveField(() => GameSkillGroupObject)
    async skillGroup(@Parent() scrim: Partial<ScrimObject>): Promise<GameSkillGroupObject> {
        if (scrim.skillGroup) return scrim.skillGroup;

        const skillGroup = await this.gameSkillGroupRepository.findOneOrFail({
            where: {id: scrim.skillGroupId},
            relations: {profile: true},
        });

        return gameSkillGroupObjectFromEntity(skillGroup, skillGroup.profile);
    }
}
