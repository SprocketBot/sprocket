import {Resolver} from "@nestjs/graphql";

import {GameSkillGroup} from "../../database";

@Resolver(() => GameSkillGroup)
export class GameSkillGroupResolver {}
