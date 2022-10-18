import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {PermissionBearer} from "../permission_bearer/permission_bearer.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class OrganizationStaffRole extends BaseModel {
    @Column()
    @Field(() => String)
    name: string;

    @Column()
    @Field(() => String)
    ordinal: number;

    @ManyToOne(() => PermissionBearer)
    @JoinColumn()
    @Field(() => PermissionBearer)
    bearer: PermissionBearer;
}
