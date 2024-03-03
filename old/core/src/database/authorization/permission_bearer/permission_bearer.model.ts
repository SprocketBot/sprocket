import {ObjectType} from "@nestjs/graphql";
import {Entity} from "typeorm";

import {BaseModel} from "../../base-model";

@Entity({schema: "sprocket"})
@ObjectType()
export class PermissionBearer extends BaseModel {}
