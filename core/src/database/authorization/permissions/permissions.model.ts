import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {Action} from "../action";
import {PermissionBearer} from "../permission_bearer";

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
