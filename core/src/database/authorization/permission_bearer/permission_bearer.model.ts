import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, OneToMany} from "typeorm";

import {BaseModel} from "../../base-model";
import {Permission} from "../models";

@Entity({schema: "sprocket"})
@ObjectType()
export class PermissionBearer extends BaseModel {
    @OneToMany(() => Permission, p => p.bearer)
    @Field(() => [Permission])
    permissions: Permission[];
}
