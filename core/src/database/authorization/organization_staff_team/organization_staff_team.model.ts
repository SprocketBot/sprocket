import {Field, ObjectType} from "@nestjs/graphql";
import {
    Column, Entity, JoinColumn, OneToOne,
} from "typeorm";

import {BaseModel} from "../../base-model";
import {PermissionBearer} from "../permission_bearer";
@Entity()
@ObjectType()
export class OrganizationStaffTeam extends BaseModel {
    @Column()
    @Field(() => String)
    name: string;

    @Column()
    @Field(() => Number)
    ordinal: number;

    @OneToOne(() => PermissionBearer)
    @JoinColumn()
    @Field(() => PermissionBearer)
    bearer: PermissionBearer;
}
