import {Field, ObjectType} from "@nestjs/graphql";

import {GameSkillGroupObject} from "../../franchise/graphql/game-skill-group.object";
import {GameModeObject} from "./game-mode.object";
import {GamePlatformObject} from "./game-platform.object";

@ObjectType()
export class GameObject {
    @Field(() => Number)
    id: number;

    @Field(() => String)
    title: string;

    // These field are all required because they are oneToMany
    // So whenever we run a conversion we need to have these available
    @Field(() => [GameModeObject])
    modes?: GameModeObject[] | undefined;

    @Field(() => [GameSkillGroupObject])
    skillGroups?: GameSkillGroupObject[] | undefined;

    @Field(() => [GamePlatformObject])
    supportedPlatforms?: GamePlatformObject[] | undefined;
}
