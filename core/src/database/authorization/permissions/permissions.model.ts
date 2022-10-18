import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Action} from "../action/action.model";
import {PermissionBearer} from "../permission_bearer/permission_bearer.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class Permission extends BaseModel {
    @ManyToOne(() => Action)
    @Field(() => Action)
    action: Action;

    @ManyToOne(() => PermissionBearer)
    @Field(() => PermissionBearer)
    bearer: PermissionBearer;
}
