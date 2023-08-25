import {ObjectType} from "@nestjs/graphql";

import {BaseObject} from "../../types/base-object";

@ObjectType()
export class GamePlatformObject extends BaseObject {}
