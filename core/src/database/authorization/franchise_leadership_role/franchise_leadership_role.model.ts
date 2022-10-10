import {Field, ObjectType} from "@nestjs/graphql";
import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {PermissionBearer} from "../permission_bearer";

@Entity({schema: "sprocket"})
@ObjectType()
export class FranchiseLeadershipRole extends BaseModel {
    @Column()
    @Field(() => String)
    name: string;

    @Column()
    @Field(() => Number)
    ordinal: number;

    @ManyToOne(() => PermissionBearer)
    @JoinColumn()
    @Field(() => PermissionBearer)
    bearer: PermissionBearer;
}
