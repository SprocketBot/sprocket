import {Parent, ResolveField, Resolver} from "@nestjs/graphql";

import {GameSkillGroupObject} from "../../franchise/graphql/game-skill-group.object";
import {GameModeObject} from "../../game/graphql/game-mode.object";
import {UserRepository} from "../../identity/database/user.repository";
import {UserObject} from "../../identity/graphql/user.object";
import {OrganizationObject} from "../../organization/graphql/organization.object";
import {ScrimObject} from "../graphql/scrim.object";

@Resolver(() => ScrimObject)
export class ScrimResolver {
    constructor(private readonly userRepository: UserRepository) {}

    @ResolveField(() => UserObject)
    async author(@Parent() scrim: ScrimObject): Promise<UserObject> {
        // TODO: THIS!
        return scrim.author;
    }

    @ResolveField(() => OrganizationObject)
    async organization(@Parent() scrim: ScrimObject): Promise<OrganizationObject> {
        // TODO: THIS!
        return scrim.organization;
    }

    @ResolveField(() => GameModeObject)
    async gameMode(@Parent() scrim: ScrimObject): Promise<GameModeObject> {
        // TODO: THIS!
        return scrim.gameMode;
    }

    @ResolveField(() => GameSkillGroupObject)
    async skillGroup(@Parent() scrim: ScrimObject): Promise<GameSkillGroupObject> {
        // TODO: THIS!
        return scrim.skillGroup;
    }
}
