import {ObjectType} from "@nestjs/graphql";
import {Entity} from "typeorm";

import {BaseModel} from "../../base-model";
@Entity()
@ObjectType()
export class PermissionBearer extends BaseModel {}
