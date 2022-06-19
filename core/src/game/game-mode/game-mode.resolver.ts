import {Resolver} from "@nestjs/graphql";

import {GameMode} from "../../database";

@Resolver(() => GameMode)
export class GameModeResolver {}
