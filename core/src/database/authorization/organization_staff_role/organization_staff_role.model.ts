import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {PermissionBearer} from "../permission_bearer";

@Entity({schema: "sprocket"})
@ObjectType()
export class OrganizationStaffRole extends BaseModel {
    @Column()
    @Field(() => String)
    name: string;

    @Column()
    @Field(() => String)
    ordinal: number;

    @OneToOne(() => PermissionBearer)
    @JoinColumn()
    @Field(() => PermissionBearer)
    bearer: PermissionBearer;
}
